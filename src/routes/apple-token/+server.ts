import { error, json } from '@sveltejs/kit';
import * as jose from 'jose';

import { APPLE_KID, APPLE_TEAM_ID, APPLE_PRIVATE_KEY } from '$env/static/private';

const pkcs8 = APPLE_PRIVATE_KEY;
const kid = APPLE_KID;
const teamID = APPLE_TEAM_ID;
const alg = 'ES256';
const secret = await jose.importPKCS8(pkcs8, alg)

export async function GET() {
    const jwt = await new jose.SignJWT({})
        .setProtectedHeader({ alg, kid })
        .setIssuedAt()
        .setIssuer(teamID)
        .setExpirationTime('2h')
        .sign(secret);

    if (jwt) {
        return json({ jwt });
    }

    throw error(500);
}