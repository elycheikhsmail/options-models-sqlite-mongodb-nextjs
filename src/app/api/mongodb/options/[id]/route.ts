import { NextRequest, NextResponse } from "next/server";
import {
  getOptionCollection,
  sanitizeOptionDocument,
  toNullableNumber,
  toNumberOrDefault,
} from "../../_lib";

const OPTIONS_COLLECTION = process.env.MONGODB_OPTIONS_COLLECTION || "options";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;

    if (!Number.isFinite(id) || !name || !depth) {
      return new NextResponse("Champs obligatoires manquants", { status: 400 });
    }

    const collection = await getOptionCollection(OPTIONS_COLLECTION);
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          id,
          name: String(name),
          nameAr: nameAr == null ? null : String(nameAr),
          priority: toNumberOrDefault(priority, 1),
          tag: tag == null ? null : String(tag),
          depth: toNumberOrDefault(depth, 0),
          parentID: toNullableNumber(parentID),
        },
      },
    );
    const option = await collection.findOne({ _id: id });

    return NextResponse.json(sanitizeOptionDocument(option), { status: 200 });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
