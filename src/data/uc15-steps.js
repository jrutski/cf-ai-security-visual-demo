/**
 * UC15 — Unweight: LLM Weight Compression
 * Lossless inference-time compression of BF16 MLP weights using Huffman coding.
 * Runs inside Cloudflare's Infire inference engine on H100 (Hopper) GPUs.
 *
 * Key results (from Cloudflare research, April 2026):
 *   - ~22% reduction in distribution bundle size
 *   - ~13% reduction in per-inference memory footprint
 *   - Bit-exact lossless output — zero quality degradation
 *   - 30–40% throughput overhead currently under active optimization
 *
 * References:
 *   https://blog.cloudflare.com/unweight-tensor-compression/
 *   https://research.cloudflare.com/papers/unweight-2026.pdf
 */

export const uc15 = {
  id: 'uc15',
  title: 'Unweight: LLM Weight Compression',
  subtitle: 'Lossless inference-time compression of BF16 MLP weights inside the Infire GPU pipeline',

  nodes: [
    // Left column — origin
    {
      id: 'api-request',
      label: 'App / Agent',
      sublabel: 'Calls Workers AI endpoint',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'An application or AI agent sends an inference request to the Workers AI endpoint — identical to any standard Workers AI call. From the caller\'s perspective, Unweight is completely transparent: the same OpenAI-compatible API, the same response format, the same output tokens. The compression and decompression pipeline operates entirely inside Cloudflare\'s infrastructure.',
    },

    // Center column — GPU pipeline
    {
      id: 'workers-ai',
      label: 'Workers AI',
      sublabel: 'Infire inference engine',
      icon: '\u26A1',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI',
      description: 'Workers AI routes the inference request to Infire, Cloudflare\'s proprietary inference engine written in Rust. Infire was purpose-built for Cloudflare\'s distributed global network and supports both pipeline-parallel and tensor-parallel multi-GPU execution. When Unweight is active, Infire loads the compressed model bundle instead of the uncompressed BF16 weights and hands off to the Unweight pipeline.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'autotuner',
      label: 'Unweight Autotuner',
      sublabel: 'Selects optimal execution pipeline',
      icon: '\u{1F50D}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Unweight — Research)',
      description: 'The Unweight autotuner profiles the current workload and selects the best of four execution pipelines for each weight matrix: (1) full-decode — decompress entire weight matrix into HBM before matmul; (2) exponent-decode — stream-decompress during the matmul, reading from compressed HBM; (3) palette-transcode — convert to a lookup-table format for bandwidth efficiency; (4) direct-palette — run matmul directly against the palette with no reconstruction. Selection depends on batch size, weight shape (tall vs. wide), and occupancy constraints.',
    },
    {
      id: 'hbm-weights',
      label: 'Compressed Weights',
      sublabel: 'High Bandwidth Memory (HBM)',
      icon: '\u{1F4BE}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Unweight — Research)',
      description: 'MLP weight matrices are stored in GPU High Bandwidth Memory (HBM) in Unweight\'s compressed format. Each BF16 value (16 bits) is split into its sign+mantissa byte (8 bits, stored verbatim) and its exponent byte (8 bits). Exponent bytes are highly redundant across weight matrices — most values cluster around a small set of patterns — and are Huffman-coded to achieve typical compression ratios of 13–22%. Fewer bytes in HBM means fewer bytes must cross the memory bus for every transformer layer.',
    },
    {
      id: 'smem-decoder',
      label: 'On-Chip Decoder',
      sublabel: 'Shared Memory (SMEM)',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Unweight — Research)',
      description: 'Producer thread groups load compressed sign+mantissa and Huffman-encoded exponent bytes from HBM into on-chip Shared Memory (SMEM) via the H100\'s Tensor Memory Accelerator (TMA) hardware. Consumer thread groups then reconstruct the exact original BF16 values directly in SMEM. The reconstructed values are fed straight to the tensor cores without ever writing back to HBM — the decompression happens entirely in fast on-chip memory, invisible to the rest of the pipeline.',
    },
    {
      id: 'tensor-cores',
      label: 'Tensor Cores',
      sublabel: 'Matrix multiplication (WGMMA)',
      icon: '\u{1F9EE}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Unweight — Research)',
      description: 'Hopper GPU tensor cores execute Warp Group Matrix Multiply Accumulate (WGMMA) instructions on the in-SMEM reconstructed BF16 values. Because decompression happens on-chip and the reconstructed weights are consumed immediately, there is no quality loss — the matmul input is bit-exact compared to a standard uncompressed BF16 execution. Pipelining across transformer layers runs "easy" layers while "hard" layers are being decoded in background CUDA streams, reducing idle time.',
    },

    // Right column — output
    {
      id: 'token-response',
      label: 'Token Response',
      sublabel: 'Lossless · bit-exact output',
      icon: '\u{1F4AC}',
      type: 'resource',
      column: 'right',
      description: 'The token output returned to the caller is bit-exact identical to what an uncompressed BF16 model would produce. Unweight is strictly lossless — every decompressed weight matrix matches the original to the bit. Quality metrics (perplexity, benchmark scores) are indistinguishable from uncompressed baseline. This is a hard requirement: any lossy compression approach would require revalidation across all models and tasks, making it impractical for a general-purpose inference system.',
    },
  ],

  edges: [
    { id: 'e-req-wai',    from: 'api-request',   to: 'workers-ai',     label: 'Inference call',        direction: 'ltr' },
    { id: 'e-wai-auto',   from: 'workers-ai',    to: 'autotuner',      label: 'Route to Infire',       direction: 'ltr' },
    { id: 'e-auto-hbm',   from: 'autotuner',     to: 'hbm-weights',    label: 'Load compressed',       direction: 'ltr' },
    { id: 'e-hbm-smem',   from: 'hbm-weights',   to: 'smem-decoder',   label: 'Transfer bytes',        direction: 'ltr' },
    { id: 'e-smem-tc',    from: 'smem-decoder',  to: 'tensor-cores',   label: 'Reconstructed BF16',    direction: 'ltr' },
    { id: 'e-tc-resp',    from: 'tensor-cores',  to: 'token-response', label: 'Token output',          direction: 'ltr' },
  ],

  steps: [
    {
      title: 'App calls Workers AI — transparent to the caller',
      product: 'Workers AI',
      description: 'An application sends an inference request to the Workers AI endpoint. The API is identical to any standard Workers AI call — same OpenAI-compatible endpoint, same request format, same response structure. Unweight is completely transparent to the caller: no new parameters, no new headers, no model-name changes. The compression pipeline activates automatically inside Cloudflare\'s infrastructure.',
      why: 'Transparency is a core design requirement. Retrofitting every client to understand compression would negate the operational benefit. Unweight delivers its savings without touching the developer\'s integration code.',
      activeNodes: ['api-request', 'workers-ai'],
      activeEdges: ['e-req-wai'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Infire inference engine activates the Unweight pipeline',
      product: 'Workers AI (Infire)',
      description: 'Workers AI routes the request to Infire, Cloudflare\'s proprietary Rust-based inference engine. When the requested model has a compressed Unweight bundle available, Infire loads that bundle instead of the standard BF16 weights and initializes the Unweight kernel pipeline. Infire supports both pipeline-parallel and tensor-parallel multi-GPU execution — Kimi K2.5 (1 trillion parameters) runs across 8× H100 GPUs with more than 30 GiB remaining for KV cache.',
      why: 'Infire was designed for Cloudflare\'s unique challenge: distributed, multi-tenant inference at global scale. Building Unweight directly into Infire means the compression benefits apply automatically to every request with no routing changes.',
      activeNodes: ['workers-ai', 'autotuner'],
      activeEdges: ['e-wai-auto'],
      docsUrl: 'https://blog.cloudflare.com/high-performance-llms',
    },
    {
      title: 'Autotuner selects the optimal execution pipeline',
      product: 'Workers AI (Unweight — Research)',
      description: 'The Unweight autotuner profiles the current batch and selects one of four execution pipelines per weight matrix: (1) full-decode — decompress entire matrix to HBM before matmul; (2) exponent-decode — stream-decompress during matmul; (3) palette-transcode — convert to lookup-table format; (4) direct-palette — run matmul against palette directly with no reconstruction. Selection is based on batch size, matrix shape (tall vs. wide), and GPU occupancy. The autotuner adapts dynamically as traffic patterns shift.',
      why: 'No single pipeline is optimal for all weight matrices and batch sizes. The autotuner ensures Unweight selects the approach with the best throughput-to-memory-savings tradeoff for each specific matrix at runtime.',
      activeNodes: ['autotuner', 'hbm-weights'],
      activeEdges: ['e-auto-hbm'],
    },
    {
      title: 'Compressed weights loaded from HBM — fewer bytes on the memory bus',
      product: 'Workers AI (Unweight — Research)',
      description: 'MLP weight matrices are stored in GPU High Bandwidth Memory (HBM) in Unweight\'s compressed format. Each BF16 value (16 bits) is split: the sign+mantissa byte (8 bits) is stored verbatim, while the exponent byte (8 bits) is Huffman-coded. Exponent values are highly non-uniform across real model weights — most cluster around a small set of values — yielding typical compression ratios of 13–22%. Fewer compressed bytes in HBM means 13–22% fewer bytes must cross the memory bus for every transformer layer computation.',
      why: 'The GPU memory bus is the primary bottleneck in LLM inference — not compute. Modern H100s have far more TFLOPS available than their HBM bandwidth can feed. Unweight attacks the bottleneck directly: compress the data so the fixed-bandwidth memory bus carries more useful information per cycle.',
      activeNodes: ['hbm-weights', 'smem-decoder'],
      activeEdges: ['e-hbm-smem'],
    },
    {
      title: 'On-chip decoder reconstructs exact BF16 values in SMEM',
      product: 'Workers AI (Unweight — Research)',
      description: 'Producer thread groups load compressed sign+mantissa and Huffman-encoded exponent bytes from HBM into on-chip Shared Memory (SMEM) via the H100\'s Tensor Memory Accelerator (TMA) hardware. Consumer thread groups then reconstruct the exact original BF16 values in-place in SMEM using a fast Huffman lookup table. The decompressed values are consumed immediately by the tensor cores — they never write back to HBM. The entire decompression step is invisible to the matmul kernel.',
      why: 'SMEM is orders of magnitude faster than HBM and has near-zero latency. By decompressing inside SMEM instead of HBM, Unweight avoids the very memory bus it is trying to relieve. The reconstruction is free in the sense that it happens in on-chip registers while waiting for the next HBM load.',
      activeNodes: ['smem-decoder', 'tensor-cores'],
      activeEdges: ['e-smem-tc'],
    },
    {
      title: 'Tensor cores execute on bit-exact reconstructed weights',
      product: 'Workers AI (Unweight — Research)',
      description: 'Hopper GPU tensor cores execute Warp Group Matrix Multiply Accumulate (WGMMA) instructions on the in-SMEM reconstructed BF16 values. The matmul input is bit-exact compared to an uncompressed BF16 execution — Unweight is strictly lossless. Pipelining across transformer layers runs "easy" layers (those with less complex exponent distributions) concurrently while "hard" layers are being decoded on background CUDA streams, reducing inter-layer idle time. Note: the current implementation incurs 30–40% throughput overhead, which the Cloudflare research team is actively optimizing.',
      why: 'Losslessness is non-negotiable: a general-purpose inference system cannot accept any quality degradation without revalidating every model on every benchmark. Bit-exact decompression ensures the output is indistinguishable from uncompressed execution.',
      activeNodes: ['smem-decoder', 'tensor-cores'],
      activeEdges: ['e-smem-tc'],
    },
    {
      title: 'Token returned — lossless, bit-exact, same quality as uncompressed',
      product: 'Workers AI',
      description: 'The final token output is returned to the caller — bit-exact identical to what an uncompressed BF16 model would have produced. Perplexity scores and benchmark results are indistinguishable from the uncompressed baseline. The overall result: a ~22% smaller model distribution bundle and ~13% lower per-inference memory footprint, achieved without any quality trade-off and without any change to the caller\'s integration code. This is a research-stage system published by the Cloudflare Research team in April 2026.',
      why: 'A 13–22% memory reduction translates directly to fewer GPUs required per inference unit at scale, lower infrastructure cost, and — eventually — faster inference once the throughput overhead is fully optimized.',
      activeNodes: ['tensor-cores', 'token-response'],
      activeEdges: ['e-tc-resp'],
      docsUrl: 'https://blog.cloudflare.com/unweight-tensor-compression/',
    },
  ],
};
