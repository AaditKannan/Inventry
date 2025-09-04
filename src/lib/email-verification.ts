// Educational email domain verification for child safety
export const EDUCATIONAL_DOMAINS = [
  // Standard .edu domains
  '.edu',
  '.edu.au',
  '.edu.ca',
  '.edu.sg',
  '.edu.my',
  '.edu.ph',
  '.edu.in',
  '.edu.hk',
  '.edu.tw',
  '.edu.mx',
  '.edu.br',
  
  // School-specific domains
  '.k12.ca.us',
  '.k12.fl.us',
  '.k12.tx.us',
  '.k12.ny.us',
  '.k12.il.us',
  '.k12.wa.us',
  '.k12.or.us',
  '.k12.mi.us',
  '.k12.oh.us',
  '.k12.pa.us',
  '.k12.nc.us',
  '.k12.ga.us',
  '.k12.va.us',
  '.k12.md.us',
  '.k12.nj.us',
  '.k12.ma.us',
  '.k12.ct.us',
  '.k12.ri.us',
  '.k12.vt.us',
  '.k12.nh.us',
  '.k12.me.us',
  
  // International school domains
  '.ac.uk',
  '.sch.uk',
  '.school.nz',
  '.schools.nsw.edu.au',
  '.qld.edu.au',
  '.sa.edu.au',
  '.wa.edu.au',
  '.nt.edu.au',
  '.tas.edu.au',
  '.vic.edu.au',
  '.act.edu.au',
  
  // Common educational organization patterns
  'schoology.com',
  'powerschool.com',
  'classroom.google.com',
  'teams.microsoft.com',
  
  // Known robotics program domains
  'firstinspires.org',
  'firstrobotics.org',
  'vexrobotics.com',
  'roboticseducation.org'
];

export const ROBOTICS_ORGANIZATION_DOMAINS = [
  'firstinspires.org',
  'firstrobotics.org',
  'vexrobotics.com',
  'roboticseducation.org',
  'usfirst.org',
  'firstchampionship.org'
];

export function isEducationalEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  
  return EDUCATIONAL_DOMAINS.some(domain => {
    if (domain.startsWith('.')) {
      return emailLower.includes(domain);
    }
    return emailLower.includes(`@${domain}`) || emailLower.endsWith(`@${domain}`);
  });
}

export function isRoboticsOrganizationEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  
  return ROBOTICS_ORGANIZATION_DOMAINS.some(domain => {
    return emailLower.includes(`@${domain}`) || emailLower.endsWith(`@${domain}`);
  });
}

export function getEmailVerificationLevel(email: string): 'high' | 'medium' | 'low' {
  if (isRoboticsOrganizationEmail(email)) {
    return 'high';
  }
  if (isEducationalEmail(email)) {
    return 'medium';
  }
  return 'low';
}

export function getEmailDomainType(email: string): string {
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  
  if (isRoboticsOrganizationEmail(email)) {
    return 'Robotics Organization';
  }
  if (emailLower.includes('.edu')) {
    return 'Educational Institution';
  }
  if (emailLower.includes('.k12.')) {
    return 'K-12 School District';
  }
  if (emailLower.includes('.ac.uk') || emailLower.includes('.sch.uk')) {
    return 'UK Educational Institution';
  }
  if (emailLower.includes('.edu.au')) {
    return 'Australian Educational Institution';
  }
  if (domain) {
    return `Organization (${domain})`;
  }
  return 'Standard Email';
}
