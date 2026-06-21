// Builds the Admitad store page where the publisher joins a program.
// Prefers explicit campaign/website ids; falls back to the slug suffix `cNNNN-wNNNN`.
function connectUrl(merchant) {
  let campaignId = merchant.campaignId;
  let websiteId = merchant.websiteId;
  if (!campaignId || !websiteId) {
    const m = String(merchant.slug || '').match(/c(\d+)-w(\d+)/);
    if (m) { campaignId = campaignId || Number(m[1]); websiteId = websiteId || Number(m[2]); }
  }
  if (!campaignId || !websiteId) return null;
  return `https://store.admitad.com/en/webmaster/websites/${websiteId}/ad/${campaignId}/`;
}

module.exports = { connectUrl };
