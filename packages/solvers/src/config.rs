use crate::types::SolverConfig;
use config::{Config, ConfigError, File};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub solver: SolverConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, ConfigError> {
        let mut builder = Config::builder()
            .add_source(File::with_name("config/default.toml").required(false))
            .add_source(File::with_name("config/local.toml").required(false))
            .add_source(config::Environment::with_prefix("SHADOW"));

        // Override with environment variables
        if let Ok(rpc_url) = env::var("SHADOW_RPC_URL") {
            builder = builder.set_override("solver.rpc_url", rpc_url)?;
        }
        if let Ok(router_addr) = env::var("SHADOW_ROUTER_ADDRESS") {
            builder = builder.set_override("solver.router_address", router_addr)?;
        }
        if let Ok(private_key) = env::var("SHADOW_PRIVATE_KEY") {
            builder = builder.set_override("solver.private_key", private_key)?;
        }

        let config = builder.build()?;
        config.try_deserialize()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            solver: SolverConfig {
                rpc_url: "https://mainnet.base.org".to_string(),
                router_address: "0x0000000000000000000000000000000000000000".to_string(),
                verifier_address: "0x0000000000000000000000000000000000000000".to_string(),
                private_key: "".to_string(),
                dex_apis: crate::types::DexConfig {
                    oneinch_api_key: "".to_string(),
                    cowswap_api_url: "https://api.cow.fi/mainnet".to_string(),
                },
                min_profit_threshold: 0.001, // 0.1%
                max_slippage: 50, // 0.5%
            },
        }
    }
}