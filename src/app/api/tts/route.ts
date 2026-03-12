import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

export async function POST(req: Request) {
  try {
    const { text, voice = 'en-US-GuyNeural' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // toStream() in msedge-tts v2 returns { audioStream, metadataStream, requestId }
    const { audioStream } = tts.toStream(text);

    // Collect streaming audio chunks into a single buffer
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => {
        tts.close();
        resolve(Buffer.concat(chunks));
      });
      audioStream.on('close', () => {
        tts.close();
        resolve(Buffer.concat(chunks));
      });
      audioStream.on('error', (err: Error) => {
        tts.close();
        reject(err);
      });
    });

    const responseBytes = new Uint8Array(audioBuffer);

    return new NextResponse(responseBytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': responseBytes.byteLength.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    console.error('TTS API Route Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
