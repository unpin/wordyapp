import Image from 'next/image';
import { db } from '../../db';
import { senses, translations, words } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async function Home() {
    const wordRows = await db.query.words.findFirst({
        where: eq(words.word, 'spielen'),
        with: {
            senses: {
                with: {
                    translations: true,
                },
            },
        },
    });
    // .limit(1);
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <pre>{JSON.stringify(wordRows, null, 2)}</pre>
        </div>
    );
}
