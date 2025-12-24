import { welfareSchemesDatabase } from '../data/schemes.js';

/**
 * Eligibility Checker Tool
 * Determines which welfare schemes a user is eligible for
 */
export class EligibilityChecker {
  constructor() {
    this.schemes = welfareSchemesDatabase;
  }

  /**
   * Check eligibility for all schemes based on user profile
   */
  checkEligibility(userProfile) {
    const eligibleSchemes = [];
    const ineligibleSchemes = [];

    this.schemes.forEach(scheme => {
      const result = this.checkSchemeEligibility(userProfile, scheme);
      if (result.eligible) {
        eligibleSchemes.push({
          scheme: scheme.id,
          name: scheme.name,
          benefits: scheme.benefits,
          matchScore: result.matchScore,
          missingInfo: result.missingInfo,
          reasoning: result.reasoning
        });
      } else {
        ineligibleSchemes.push({
          scheme: scheme.id,
          name: scheme.name,
          reason: result.reason,
          requiredCriteria: result.requiredCriteria
        });
      }
    });

    // Sort eligible schemes by match score
    eligibleSchemes.sort((a, b) => b.matchScore - a.matchScore);

    return {
      eligible: eligibleSchemes,
      ineligible: ineligibleSchemes,
      totalEligible: eligibleSchemes.length,
      totalIneligible: ineligibleSchemes.length
    };
  }

  /**
   * Check eligibility for a specific scheme
   */
  checkSchemeEligibility(userProfile, scheme) {
    let matchScore = 0;
    let maxScore = 0;
    const missingInfo = [];
    const reasoning = [];
    const errors = [];

    const eligibility = scheme.eligibility;

    // Check age
    if (eligibility.minAge !== undefined || eligibility.maxAge !== undefined) {
      maxScore += 20;
      if (userProfile.age === null) {
        missingInfo.push('उम्र');
      } else {
        const meetsMinAge = eligibility.minAge === undefined || userProfile.age >= eligibility.minAge;
        const meetsMaxAge = eligibility.maxAge === undefined || userProfile.age <= eligibility.maxAge;
        if (meetsMinAge && meetsMaxAge) {
          matchScore += 20;
          reasoning.push(`उम्र ${userProfile.age} उपयुक्त है`);
        } else {
          errors.push(`उम्र ${userProfile.age} न्यूनतम ${eligibility.minAge} और अधिकतम ${eligibility.maxAge} के भीतर होनी चाहिए`);
        }
      }
    }

    // Check income
    if (eligibility.maxAnnualIncome !== undefined) {
      maxScore += 25;
      if (userProfile.income === null) {
        missingInfo.push('वार्षिक आय');
      } else {
        if (userProfile.income <= eligibility.maxAnnualIncome) {
          matchScore += 25;
          reasoning.push(`आय सीमा के अंदर है`);
        } else {
          errors.push(`आय ₹${userProfile.income} अधिकतम ₹${eligibility.maxAnnualIncome} से अधिक है`);
        }
      }
    }

    // Check categories (SC, ST, OBC, etc.)
    if (eligibility.categories && eligibility.categories.length > 0) {
      maxScore += 20;
      if (userProfile.categories.length === 0) {
        missingInfo.push('सामाजिक श्रेणी');
      } else {
        const categoryMatch = userProfile.categories.some(cat => eligibility.categories.includes(cat));
        if (categoryMatch || eligibility.categories.includes('सर्व')) {
          matchScore += 20;
          reasoning.push(`श्रेणी ${userProfile.categories.join(', ')} योग्य है`);
        } else {
          errors.push(`श्रेणी ${userProfile.categories.join(', ')} इस योजना के लिए योग्य नहीं है`);
        }
      }
    }

    // Check if rural requirement
    if (eligibility.isRural === true && userProfile.location) {
      maxScore += 15;
      if (userProfile.location.isRural) {
        matchScore += 15;
        reasoning.push('ग्रामीण क्षेत्र से योग्य');
      } else {
        errors.push('यह योजना केवल ग्रामीण क्षेत्रों के लिए है');
      }
    }

    // Check if farmer requirement
    if (eligibility.isKisan === true && userProfile.occupation) {
      maxScore += 20;
      if (userProfile.occupation === 'कृषक' || userProfile.occupation === 'farmer') {
        matchScore += 20;
        reasoning.push('किसान श्रेणी के अंतर्गत योग्य');
      } else {
        errors.push('यह योजना केवल किसानों के लिए है');
      }
    }

    // Check student status
    if (eligibility.studentStatus === true && userProfile.isStudent !== undefined) {
      maxScore += 15;
      if (userProfile.isStudent) {
        matchScore += 15;
        reasoning.push('विद्यार्थी पात्र है');
      } else {
        errors.push('यह योजना केवल विद्यार्थियों के लिए है');
      }
    }

    const eligible = errors.length === 0 && (missingInfo.length === 0 || matchScore > maxScore * 0.7);
    const score = maxScore > 0 ? (matchScore / maxScore) * 100 : 0;

    return {
      eligible,
      matchScore: score,
      missingInfo,
      reasoning,
      errors
    };
  }

  /**
   * Get specific scheme details
   */
  getSchemeDetails(schemeId) {
    return this.schemes.find(s => s.id === schemeId);
  }

  /**
   * Recommend next questions to gather missing information
   */
  getNextQuestions(userProfile, eligibleSchemes) {
    const questions = [];

    if (userProfile.age === null) {
      questions.push("आपकी उम्र क्या है?");
    }

    if (userProfile.income === null) {
      questions.push("आपकी वार्षिक आय क्या है?");
    }

    if (userProfile.categories.length === 0) {
      questions.push("आप किस सामाजिक श्रेणी से संबंधित हैं? (सामान्य, OBC, SC, ST)");
    }

    if (userProfile.location === null) {
      questions.push("आप शहरी या ग्रामीण क्षेत्र में रहते हैं?");
    }

    if (userProfile.dependents === 0 && userProfile.age !== null && userProfile.age > 25) {
      questions.push("आपके कितने आश्रित हैं?");
    }

    return questions;
  }
}

export default EligibilityChecker;
