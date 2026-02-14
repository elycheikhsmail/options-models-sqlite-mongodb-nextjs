import { NextRequest, NextResponse } from "next/server";
import {
  getNextOptionId,
  getOptionCollection,
  sanitizeOptionDocument,
  sanitizeOptionDocuments,
  toNullableNumber,
  toNumberOrDefault,
} from "../_lib";

const OPTIONS_COLLECTION = process.env.MONGODB_OPTIONS_COLLECTION || "options";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const collection = await getOptionCollection(OPTIONS_COLLECTION);

    const rows =
      parentId === null
        ? await collection.find({ depth: 1 }).sort({ id: 1 }).toArray()
        : await collection
            .find({ parentID: toNullableNumber(parentId) })
            .sort({ id: 1 })
            .toArray();

    return NextResponse.json(sanitizeOptionDocuments(rows));
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;

    if (!name || !depth) {
      return new NextResponse("Champs obligatoires manquants", { status: 400 });
    }

    const id = await getNextOptionId(OPTIONS_COLLECTION);
    const document = {
      _id: id,
      id,
      name: String(name),
      nameAr: nameAr == null ? null : String(nameAr),
      priority: toNumberOrDefault(priority, 1),
      tag: tag == null ? null : String(tag),
      depth: toNumberOrDefault(depth, 0),
      parentID: toNullableNumber(parentID),
    };

    const collection = await getOptionCollection(OPTIONS_COLLECTION);
    await collection.insertOne(document);

    return NextResponse.json(sanitizeOptionDocument(document), { status: 201 });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
