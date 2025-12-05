mod config;
mod types;
mod event_listener;
mod decryption;
mod routing;
mod bundling;
mod submission;

use crate::config::AppConfig;
use crate::event_listener::EventListener;
use crate::types::SolverError;
use clap::Parser;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, error};

#[derive(Parser)]
#[command(name = "shadow-solver")]
#[command(about = "Shadow Protocol solver node")]
struct Args {
    /// Configuration file path
    #[arg(short, long, default_value = "config/default.toml")]
    config: String,

    /// Enable verbose logging
    #[arg(short, long)]
    verbose: bool,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(if std::env::var("RUST_LOG").is_ok() {
            tracing::Level::DEBUG
        } else {
            tracing::Level::INFO
        })
        .init();

    // Parse command line arguments
    let args = Args::parse();

    // Load configuration
    let config = match AppConfig::load() {
        Ok(config) => config,
        Err(e) => {
            error!("Failed to load configuration: {}", e);
            return Err(e.into());
        }
    };

    info!("Starting Shadow Protocol solver...");
    info!("Router address: {}", config.solver.router_address);
    info!("RPC URL: {}", config.solver.rpc_url);

    // Initialize components
    let event_listener = Arc::new(Mutex::new(
        EventListener::new(config.solver.clone()).await?
    ));

    // Start event listening
    let listener_handle = {
        let listener = Arc::clone(&event_listener);
        tokio::spawn(async move {
            if let Err(e) = listener.lock().await.start().await {
                error!("Event listener error: {}", e);
            }
        })
    };

    // Wait for shutdown signal
    tokio::signal::ctrl_c().await?;
    info!("Shutdown signal received, stopping solver...");

    // Stop components
    event_listener.lock().await.stop().await;

    // Wait for tasks to complete
    listener_handle.await?;

    info!("Solver stopped successfully");
    Ok(())
}