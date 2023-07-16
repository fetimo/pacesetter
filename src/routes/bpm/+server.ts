import { json } from '@sveltejs/kit';

import { GETSONGBPM_KEY } from '$env/static/private';

export async function GET(context) {
    const url = new URL(context.request.url);
    const query = `https://api.getsongbpm.com/search/?api_key=${GETSONGBPM_KEY}&type=both&limit=1&lookup=song:${encodeURIComponent(url.searchParams.get('track') || '')} artist:${encodeURIComponent(url.searchParams.get('artist') || '')}`;
    const x = await fetch(query);

    const res = await x.json();

    if (!res.search.error) {
        return json(res.search[0]);
    }

    return json({});
}