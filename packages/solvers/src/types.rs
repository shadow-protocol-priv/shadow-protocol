use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntentData {
    pub from_token: String,
    pub to_token: String,
    pub amount: String,
    pub slippage: u32, // in basis points
    pub user_address: String,
    pub deadline: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedIntent {
    pub intent_hash: String,
    pub encrypted_data: String,
    pub signature: String,
    pub nonce: u64,
    pub deadline: u64,
    pub user: String,
}

#[derive(Debug, Clone)]
pub struct DecryptedIntent {
    pub intent_hash: String,
    pub data: IntentData,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwapRoute {
    pub from_token: String,
    pub to_token: String,
    pub amount_in: String,
    pub amount_out: String,
    pub path: Vec<String>, // token addresses
    pub dex: String, // "1inch", "cowswap", etc.
    pub gas_estimate: u64,
}

#[derive(Debug, Clone)]
pub struct TransactionBundle {
    pub transactions: Vec<alloy::rpc::types::TransactionRequest>,
    pub intent_hash: String,
    pub solver_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolverConfig {
    pub rpc_url: String,
    pub router_address: String,
    pub verifier_address: String,
    pub private_key: String,
    pub dex_apis: DexConfig,
    pub fhe: FheConfig,
    pub min_profit_threshold: f64,
    pub max_slippage: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DexConfig {
    pub oneinch_api_key: String,
    pub cowswap_api_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FheConfig {
    pub public_key: String,
    pub private_key_path: String,
}

#[derive(Debug, Clone)]
pub enum SolverError {
    DecryptionFailed(String),
    DecryptionError(String),
    RoutingFailed(String),
    SubmissionFailed(String),
    NetworkError(String),
}

impl std::fmt::Display for SolverError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolverError::DecryptionFailed(msg) => write!(f, "Decryption failed: {}", msg),
            SolverError::DecryptionError(msg) => write!(f, "Decryption error: {}", msg),
            SolverError::RoutingFailed(msg) => write!(f, "Routing failed: {}", msg),
            SolverError::SubmissionFailed(msg) => write!(f, "Submission failed: {}", msg),
            SolverError::NetworkError(msg) => write!(f, "Network error: {}", msg),
        }
    }
}

impl std::error::Error for SolverError {}