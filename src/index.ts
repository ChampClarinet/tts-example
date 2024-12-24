import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .decorate("getAPIKey", () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is not defined");
    return apiKey;
  })
  .post(
    "/tts",
    async ({ body, getAPIKey, set }) => {
      if (body.text.length == 0) {
        set.status = 204;
        return;
      }
      const payload = {
        text: body.text,
        speaker: "1",
        volume: 1,
        speed: 1,
        type_media: "m4a",
        save_file: true,
      };
      const response = await fetch(
        "https://api-voice.botnoi.ai/openapi/v1/generate_audio",
        {
          headers: {
            "Botnoi-Token": getAPIKey(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          method: "POST",
        }
      );

      const jsonResponse: { text: string; audio_url: string; point: number } =
        await response.json();
      const link = jsonResponse.audio_url;
      const audioResponse = await fetch(link);
      const audioBlob = await audioResponse.blob();
      return audioBlob;
    },
    {
      body: t.Object({
        text: t.String(),
      }),
    }
  )
  .post("/stt", ({ body, set }) => {}, { body: t.File() })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
