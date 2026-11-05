import { TargetCountry } from '../types';

export interface LocalisationOptions {
  country: TargetCountry;
  useCanadianEnglish?: boolean; // When country === 'Canada', choose Canadian or US English
}

const US_TO_UK_MAP: [RegExp, string][] = [
  [/\bpersonalized\b/gi, 'personalised'],
  [/\bpersonalize\b/gi, 'personalise'],
  [/\bpersonalizing\b/gi, 'personalising'],
  [/\bpersonalization\b/gi, 'personalisation'],
  [/\bcustomized\b/gi, 'customised'],
  [/\bcustomize\b/gi, 'customise'],
  [/\bcustomizing\b/gi, 'customising'],
  [/\bcustomization\b/gi, 'customisation'],
  [/\bcolor\b/gi, 'colour'],
  [/\bcolors\b/gi, 'colours'],
  [/\bcolored\b/gi, 'coloured'],
  [/\bdecor\b/gi, 'décor'],
  [/\bjewelry\b/gi, 'jewellery'],
  [/\bfavorite\b/gi, 'favourite'],
  [/\bfavorites\b/gi, 'favourites'],
  [/\borganize\b/gi, 'organise'],
  [/\borganized\b/gi, 'organised'],
  [/\borganizer\b/gi, 'organiser'],
  [/\bcenter\b/gi, 'centre'],
  [/\bcenters\b/gi, 'centres'],
  [/\btheater\b/gi, 'theatre'],
  [/\bneighbor\b/gi, 'neighbour'],
  [/\bhonor\b/gi, 'honour'],
  [/\bflavor\b/gi, 'flavour'],
];

const UK_TO_US_MAP: [RegExp, string][] = [
  [/\bpersonalised\b/gi, 'personalized'],
  [/\bpersonalise\b/gi, 'personalize'],
  [/\bpersonalising\b/gi, 'personalizing'],
  [/\bpersonalisation\b/gi, 'personalization'],
  [/\bcustomised\b/gi, 'customized'],
  [/\bcustomise\b/gi, 'customize'],
  [/\bcustomising\b/gi, 'customizing'],
  [/\bcustomisation\b/gi, 'customization'],
  [/\bcolour\b/gi, 'color'],
  [/\bcolours\b/gi, 'colors'],
  [/\bcoloured\b/gi, 'colored'],
  [/\bdécor\b/gi, 'decor'],
  [/\bjewellery\b/gi, 'jewelry'],
  [/\bfavourite\b/gi, 'favorite'],
  [/\bfavourites\b/gi, 'favorites'],
  [/\borganise\b/gi, 'organize'],
  [/\borganised\b/gi, 'organized'],
  [/\borganiser\b/gi, 'organizer'],
  [/\bcentre\b/gi, 'center'],
  [/\bcentres\b/gi, 'centers'],
  [/\btheatre\b/gi, 'theater'],
  [/\bneighbour\b/gi, 'neighbor'],
  [/\bhonour\b/gi, 'honor'],
  [/\bflavour\b/gi, 'flavor'],
];

/**
 * Localises text based on target country and Canadian English preference.
 * Does not alter product facts, materials, dimensions, or technical numbers.
 */
export function localiseText(text: string, options: LocalisationOptions): string {
  if (!text) return text;

  const { country, useCanadianEnglish = true } = options;

  if (country === 'UK' || country === 'Australia' || (country === 'Canada' && useCanadianEnglish)) {
    let result = text;
    for (const [regex, replacement] of US_TO_UK_MAP) {
      result = result.replace(regex, (match) => {
        // Preserve title capitalization
        if (match[0] === match[0].toUpperCase()) {
          return replacement[0].toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
    return result;
  }

  // USA or Canada with US English
  if (country === 'USA' || (country === 'Canada' && !useCanadianEnglish)) {
    let result = text;
    for (const [regex, replacement] of UK_TO_US_MAP) {
      result = result.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return replacement[0].toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
    return result;
  }

  return text;
}
