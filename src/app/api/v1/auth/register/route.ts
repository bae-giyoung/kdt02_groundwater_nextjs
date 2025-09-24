import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextResponse) {

    console.log("회원가입 테스트 시작......");

    try {
        const {a, b, c, d} = await request.json();
        console.log(a, b, c, d);

        // 백엔드에서 회원가입 성공했다고 가정
        // 여기



    } catch (error) {
        console.log("회원가입 테스트 오류!");
        return NextResponse.json({"code": "TEST_REGISTER_ERROR", "message": "Next API 테스트 오류"});
    }

}