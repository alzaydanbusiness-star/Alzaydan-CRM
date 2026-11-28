// Normalizer ensuring every opportunity has all expected fields regardless of how/where it was saved
export const normalizeOpportunity = (item) => {
  if (!item || typeof item !== 'object') return null;
  const owner = item.owner || item.opportunityOwner || item.salesRep || item.assignedTo || 'Al Zaydan';
  const name = item.name || item.title || item.opportunityTitle || 'Commercial Opportunity';
  const code = item.code || item.opportunityNumber || (typeof item.id === 'string' && item.id.startsWith('OPP-') ? item.id : `CTEQ#${item.id || 7539}`);
  const customer = item.customer || item.customerName || item.client || 'Enterprise Customer';
  const stage = item.stage || 'Enquiry';
  const probability = Number(item.probability ?? item.winProbability ?? 10);
  const rating = item.rating || 'COLD';
  const classification = item.classification || 'A - Enterprise';
  const bizType = item.bizType || item.businessOpportunity || 'New Business';
  const campaign = item.campaign || 'Direct Inbound';
  const oppDate = item.oppDate || item.date || item.opportunityDate || '16-11-2026';
  const assignedDate = item.assignedDate || item.oppDate || item.date || '16-11-2026';
  const lastActivity = item.lastActivity || oppDate;
  const lastActivityDays = item.lastActivityDays || 'Today';
  const closeDate = item.closeDate || item.expectedClose || '28-11-2026';
  const status = item.status || 'Open';
  const amount = item.amount || item.value || (item.numericValue ? `AED ${Number(item.numericValue).toLocaleString()}` : 'AED 0');
  const ownerAvatarBg = item.ownerAvatarBg || 'bg-[#011635] text-white';

  return {
    ...item,
    id: item.id || Date.now(),
    code,
    opportunityNumber: item.opportunityNumber || code,
    owner,
    opportunityOwner: item.opportunityOwner || owner,
    salesRep: item.salesRep || owner,
    name,
    title: item.title || name,
    customer,
    customerName: item.customerName || customer,
    client: item.client || customer,
    oppDate,
    assignedDate,
    lastActivity,
    lastActivityDays,
    closeDate,
    stage,
    probability,
    winProbability: item.winProbability ?? probability,
    rating,
    classification,
    bizType,
    campaign,
    amount,
    status,
    ownerAvatarBg
  };
};
