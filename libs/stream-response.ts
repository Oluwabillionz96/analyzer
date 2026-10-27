import { AnalysisResponse, AnalysisStages, ApiResponse } from "./types";

export default async function streamResponse(response:Response, onStage?: (stage: AnalysisStages)=>void)
:Promise<ApiResponse<AnalysisResponse>>{
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error ?? body.message ?? `Something went wrong.`);
  }

  if (
    !response.headers
      .get("content-type")
      ?.includes("text/event-stream")
  ) {
    return response.json();
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });

    let frameEnd: number;

    while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, frameEnd).trim();
      buffer = buffer.slice(frameEnd + 2);

      let event = "";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          data = line.slice(5).trim();
        }
      }

      if (data) {
        const payload = JSON.parse(data);
        const msg =
          (payload as ApiResponse<AnalysisResponse>).error ??
          "Analysis Failed";

        if (event === "stage") {
          onStage?.(payload.data.stage);
        } else if (event === "error") {
          throw new Error(msg);
        } else if (event === "analysis") {
          if (payload.success) {
            return payload as ApiResponse<AnalysisResponse>;
          }
          throw new Error(msg);
        }
      }
    }
  }
  throw new Error("Server did not return any analysis data.");
}