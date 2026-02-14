import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const db = new DatabaseSync('database.db');
    let rows;
    if (parentId === null) {
      // Si parentId n'est pas fourni, retourne les options de depth = 1
      rows = db.prepare('SELECT * FROM lieux WHERE depth = 1').all();
    } else {
      // Si parentId est fourni, retourne les options dont parentID = parentId
      rows = db.prepare('SELECT * FROM lieux WHERE parentID = ?').all(parentId);
    }
    db.close();
    return NextResponse.json(rows);
  } catch {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;
    if (!name || !depth) {
      return new NextResponse('Champs obligatoires manquants', { status: 400 });
    }

    const db = new DatabaseSync('database.db');
    const stmt = db.prepare(
      'INSERT INTO lieux (name, nameAr, priority, tag, depth, parentID) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, nameAr, priority, tag, depth, parentID);
    const insertedId = Number(result.lastInsertRowid);
    const option = db.prepare('SELECT * FROM lieux WHERE id = ?').get(insertedId);
    db.close();

    return NextResponse.json(option, { status: 201 });
  } catch {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
