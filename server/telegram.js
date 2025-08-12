import crypto from 'crypto';

export async function verifyInitData(initData) {
  if (!initData) return false;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto
    .createHash('sha256')
    .update(process.env.BOT_TOKEN ?? '')
    .digest();

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  if (hmac !== hash) return false;

  const user = params.get('user');
  return { user: user ? JSON.parse(user) : null };
}

export async function createStarsInvoice({ amount, description }) {
  return { ok: true, amount, description };
}

