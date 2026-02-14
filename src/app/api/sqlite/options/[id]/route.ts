import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;

    if (!Number.isFinite(id) || !name || !depth) {
      return new NextResponse('Champs obligatoires manquants', { status: 400 });
    }

    const db = new DatabaseSync('database.db');
    const stmt = db.prepare(
      'UPDATE options SET name = ?, nameAr = ?, priority = ?, tag = ?, depth = ?, parentID = ? WHERE id = ?'
    );
    stmt.run(name, nameAr, priority, tag, depth, parentID, id);
    const option = db.prepare('SELECT * FROM options WHERE id = ?').get(id);
    db.close();

    return NextResponse.json(option, { status: 200 });
  } catch {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
