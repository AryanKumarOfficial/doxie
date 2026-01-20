import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";


export async function POST(req: Request, { params }: { params: { id: string } }) {
    const body = await req.json();
    await inngest.send({ name: "document.save", data: { documentId: params.id, snapshot: body.snapshot, createdBy: body.userId } });
    return NextResponse.json({ ok: true });
}