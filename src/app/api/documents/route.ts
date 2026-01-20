import { NextResponse } from "next/server";
import { createDocument, listDocuments } from "@/services/documents.service";


export async function GET(req: Request) {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId")!;
    const docs = await listDocuments(orgId);
    return NextResponse.json(docs);
}


export async function POST(req: Request) {
    const json = await req.json();
    const { orgId, title } = json;
    const doc = await createDocument(orgId, json.ownerId, title);
    return NextResponse.json(doc);
}