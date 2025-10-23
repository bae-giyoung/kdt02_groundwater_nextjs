async function safeParseResponseToJson<T>(response: Response): Promise<T | null> {
    const contentType = response.headers.get("content-type") ?? "";
    
    if(!contentType || !contentType.includes("application/json"))  {
        return null;
    }

    try {
        return (await response.clone().json()) as T; // stream이므로 유틸 함수에서는 clone하는 걸로
    } catch (error) {
        console.error("JSON 파싱 실패: ", error);
        return null;
    }
}

export default safeParseResponseToJson;