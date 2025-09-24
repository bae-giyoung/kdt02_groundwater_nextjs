import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    console.log("로그인 테스트 시작.....")

    try {
        const {username, email, password} = await request.json();
        console.log(username, email, password);

        // 위 정보를 백엔드 보내고 로그인 인증했다고 가정, 쿠키에 sessionid 담아서 받아옴
        // 여기

        return NextResponse.json({
            "user": {
                "userId": "abcdef",
                "username": username,
                "roles": "USER",
            },
            "sessionExpiresIn": 3600
        });
        
    } catch (error) {
        console.log("로그인 테스트 오류!")
        return NextResponse.json({"code": "TEST_LOGIN_ERROR", "message": "Next API 테스트 오류"});
    }
}