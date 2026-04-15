/**
 * UC11 — Voice AI Agent
 * Build real-time voice agents with speech-to-text, LLM turns, and text-to-speech
 * over WebSocket — with persistent conversation history and optional telephony.
 *
 * Architecture:
 *   Client mic audio → WebSocket (binary frames) → STT → LLM turn → TTS synthesis
 *   → streamed audio back to client
 *
 * Server: withVoice mixin on a Durable Object (Agents SDK @cloudflare/voice)
 * STT options: Workers AI (Whisper), Deepgram
 * TTS options: Workers AI, Cartesia, ElevenLabs, OpenAI
 * Telephony: Twilio SIP integration (optional)
 *
 * References:
 *   https://developers.cloudflare.com/agents/api-reference/voice/
 *   https://developers.cloudflare.com/agents/
 *   https://developers.cloudflare.com/workers-ai/
 */

export const uc11 = {
  id: 'uc11',
  title: 'Voice AI Agent',
  subtitle: 'Real-time voice agents with speech-to-text, LLM turns, and streaming TTS over WebSocket',

  nodes: [
    // Left column — client entry points
    {
      id: 'browser-user',
      label: 'Browser / App User',
      sublabel: 'Microphone input, audio output',
      icon: '\u{1F3A4}',
      type: 'user',
      column: 'left',
      description: 'End users connect via browser or native app using the VoiceClient or useVoiceAgent React hook from @cloudflare/voice/react. Mic audio is captured and streamed as binary WebSocket frames. Interruption handling cancels in-flight TTS playback if the user starts speaking during a response.',
    },
    {
      id: 'telephony',
      label: 'Telephony (Twilio)',
      sublabel: 'Phone / SIP → WebSocket bridge',
      icon: '\u{1F4F1}',
      type: 'resource',
      column: 'left',
      description: 'Traditional phone calls or SIP endpoints can be bridged to the Voice Agent via Twilio\'s Media Streams or SIP integration. Twilio converts inbound PSTN audio to WebSocket binary frames, enabling AI agents to handle phone calls with the same pipeline as browser clients.',
    },
    // Center column — Voice Agent pipeline (Durable Object)
    {
      id: 'voice-agent',
      label: 'Voice Agent',
      sublabel: 'withVoice mixin, Durable Objects, WebSocket',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'The Voice Agent is a Durable Object mixing in withVoice from @cloudflare/voice. It manages per-call WebSocket connections, runs the STT → LLM → TTS pipeline, handles interruption detection (user speech cancels current TTS), and persists conversation history in built-in SQLite across restarts and reconnects. Pipeline hooks let you intercept and transform text at every stage.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      id: 'stt',
      label: 'Speech-to-Text',
      sublabel: 'Workers AI Whisper / Deepgram',
      icon: '\u{1F50A}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Whisper)',
      description: 'A continuous per-call transcriber session handles turn detection and transcription. Built-in provider: Workers AI (OpenAI Whisper via @cf/openai/whisper). Third-party options: Deepgram (streaming, high accuracy), or any WebSocket-based STT. The provider is configured in the withVoice options; switching requires no application code change.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/models/',
    },
    {
      id: 'llm-turn',
      label: 'LLM Turn Processing',
      sublabel: 'onTurn: context + tools + streaming',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (onTurn)',
      description: 'The onTurn(transcript, context) callback receives the user\'s transcribed utterance and full conversation context (stored in SQLite). It calls any LLM — Workers AI, OpenAI, Anthropic, Gemini — with the conversation history and any server-side tools. The response is streamed token-by-token to the TTS stage for concurrent synthesis (sentence-chunked).',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      id: 'tts',
      label: 'Text-to-Speech',
      sublabel: 'Streaming synthesis, sentence-chunked',
      icon: '\u{1F4AC}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (TTS)',
      description: 'LLM output tokens are sentence-chunked and synthesized concurrently — audio for the first sentence begins streaming before the LLM has finished generating. Built-in provider: Workers AI TTS. Third-party: Cartesia, ElevenLabs, OpenAI TTS. Audio streams back to the client as binary WebSocket frames. If the user interrupts, in-flight TTS is cancelled.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    // Right column — external providers and persistence
    {
      id: 'workers-ai-voice',
      label: 'Workers AI',
      sublabel: 'Whisper STT + TTS models on-network',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'right',
      description: 'Workers AI provides both STT (Whisper) and TTS models running on Cloudflare\'s GPU network with zero egress fees. All audio processing stays on Cloudflare\'s network — no data leaves to a third-party transcription or synthesis service, important for regulated industries.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'ext-voice-providers',
      label: 'Third-Party Providers',
      sublabel: 'Deepgram, Cartesia, ElevenLabs, OpenAI',
      icon: '\u{1F4E1}',
      type: 'ai-service',
      column: 'right',
      description: 'For specialized voice quality or language support, the Voice Agent can use third-party STT providers (Deepgram for real-time streaming, high accuracy) and TTS providers (Cartesia for ultra-low latency, ElevenLabs for voice cloning, OpenAI TTS). Switching providers requires only a configuration change — no pipeline code changes.',
    },
  ],

  edges: [
    { id: 'e-browser-agent',   from: 'browser-user',    to: 'voice-agent',       label: 'WebSocket (binary audio)', direction: 'ltr' },
    { id: 'e-twilio-agent',    from: 'telephony',        to: 'voice-agent',       label: 'Media Streams',            direction: 'ltr' },
    { id: 'e-agent-stt',       from: 'voice-agent',      to: 'stt',               label: 'Audio frames',             direction: 'ltr' },
    { id: 'e-stt-llm',         from: 'stt',              to: 'llm-turn',          label: 'Transcript',               direction: 'ltr' },
    { id: 'e-llm-tts',         from: 'llm-turn',         to: 'tts',               label: 'Token stream',             direction: 'ltr' },
    { id: 'e-tts-agent',       from: 'tts',              to: 'voice-agent',       label: 'Audio chunks',             direction: 'rtl' },
    { id: 'e-stt-wai',         from: 'stt',              to: 'workers-ai-voice',  label: '',                         direction: 'ltr' },
    { id: 'e-stt-ext',         from: 'stt',              to: 'ext-voice-providers', label: '',                       direction: 'ltr' },
    { id: 'e-tts-wai',         from: 'tts',              to: 'workers-ai-voice',  label: '',                         direction: 'ltr' },
    { id: 'e-tts-ext',         from: 'tts',              to: 'ext-voice-providers', label: '',                       direction: 'ltr' },
    { id: 'e-agent-browser',   from: 'voice-agent',      to: 'browser-user',      label: 'Streamed audio',           direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Client connects via WebSocket',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'The browser client initializes a VoiceClient (or useVoiceAgent React hook) connecting to the Voice Agent\'s WebSocket endpoint. For phone calls, Twilio bridges PSTN audio to the same WebSocket interface via Media Streams. The Voice Agent Durable Object handles the persistent, stateful session — surviving reconnects with full conversation history restored from SQLite.',
      why: 'A Durable Object per call means each conversation has isolated, durable state. Reconnecting a dropped call resumes from exactly where it left off — no lost context.',
      activeNodes: ['browser-user', 'telephony', 'voice-agent'],
      activeEdges: ['e-browser-agent', 'e-twilio-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'Mic audio streamed to Speech-to-Text',
      product: 'Workers AI (Whisper)',
      description: 'The Voice Agent streams microphone audio (binary WebSocket frames) to the configured STT provider. A continuous per-call transcriber session handles voice activity detection and turn detection — detecting when the user has finished speaking. Workers AI (Whisper) is the built-in zero-egress option; Deepgram is available for lower latency and higher accuracy.',
      why: 'Continuous STT with turn detection eliminates the need for push-to-talk interfaces. Users can speak naturally and the agent detects pauses automatically.',
      activeNodes: ['voice-agent', 'stt', 'workers-ai-voice', 'ext-voice-providers'],
      activeEdges: ['e-agent-stt', 'e-stt-wai', 'e-stt-ext'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/models/',
    },
    {
      title: 'Transcript triggers LLM turn',
      product: 'Agents SDK (onTurn)',
      description: 'The transcribed user utterance triggers the onTurn(transcript, context) callback with the full conversation history from SQLite. The LLM is called — Workers AI, OpenAI, Anthropic, or any provider — with conversation context, system prompt, and any available tools. Tool calls are executed and results added to context before the final response is generated.',
      why: 'SQLite-persisted conversation history means the agent remembers the full call context — previous turns, tool results, clarifications — enabling coherent multi-turn voice conversations.',
      activeNodes: ['stt', 'llm-turn'],
      activeEdges: ['e-stt-llm'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'LLM response synthesized to speech',
      product: 'Workers AI (TTS)',
      description: 'LLM output tokens are sentence-chunked by the withVoice pipeline and passed to TTS concurrently — synthesis starts for the first sentence before the LLM has finished generating the full response. This dramatically reduces time-to-first-audio. Workers AI TTS, Cartesia, ElevenLabs, or OpenAI TTS are configurable providers.',
      why: 'Sentence-chunked concurrent synthesis achieves sub-second time-to-first-audio even with long LLM responses — making voice interactions feel natural rather than robotic.',
      activeNodes: ['llm-turn', 'tts', 'workers-ai-voice', 'ext-voice-providers'],
      activeEdges: ['e-llm-tts', 'e-tts-wai', 'e-tts-ext'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'Audio streamed back — interruption handling',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'Synthesized audio chunks are streamed back to the client as binary WebSocket frames. If the user begins speaking during playback (detected by the STT transcriber), the Voice Agent immediately cancels the in-flight TTS response and begins processing the new utterance. This interruption handling makes conversations feel responsive and natural.',
      why: 'Without interruption handling, users must wait for the agent to finish speaking before they can respond — even when they want to correct, redirect, or clarify. Natural interruption creates human-like dialogue.',
      activeNodes: ['tts', 'voice-agent', 'browser-user'],
      activeEdges: ['e-tts-agent', 'e-agent-browser'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'Conversation persisted in SQLite',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'Every turn — user transcript, tool calls and results, assistant response — is automatically persisted to the Durable Object\'s built-in SQLite database. Conversation history survives agent restarts, deploys, and client disconnects. On reconnect, the full history is restored automatically. Pipeline hooks allow transforming text at any stage: content moderation, PII redaction, custom formatting.',
      why: 'Automatic conversation persistence eliminates a significant engineering burden — no external database, no session management, no history reconstruction logic. The conversation is always available in the agent instance.',
      activeNodes: ['voice-agent'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'Telephony: phone calls via Twilio',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'For telephony integration, Twilio Media Streams or SIP trunking bridges PSTN phone calls to the same Voice Agent WebSocket interface. The agent handles the call identically to a browser session — full STT → LLM → TTS pipeline, conversation persistence, tool calls, and interruption handling. Text message responses via Twilio SMS are also supported.',
      why: 'Telephony integration enables the same Voice Agent to handle web, mobile, and phone channels with a single codebase. AI-powered phone agents use existing call center infrastructure without replacing it.',
      activeNodes: ['telephony', 'voice-agent'],
      activeEdges: ['e-twilio-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
    {
      title: 'Response delivered, turn complete',
      product: 'Agents SDK (@cloudflare/voice)',
      description: 'The synthesized audio response completes delivery to the client. The agent re-enters listening state, ready for the next user turn. All pipeline metrics (STT latency, LLM first-token latency, TTS synthesis time, end-to-end round-trip) are available via the pipeline metrics API for monitoring and optimization.',
      why: 'End-to-end pipeline metrics per turn enable systematic latency optimization — identifying whether bottlenecks are in transcription, LLM generation, or synthesis — without instrumenting each component separately.',
      activeNodes: ['voice-agent', 'browser-user'],
      activeEdges: ['e-agent-browser'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/voice/',
    },
  ],
};
