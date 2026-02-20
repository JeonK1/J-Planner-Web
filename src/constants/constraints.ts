export const CONSTRAINTS = {
  plan: {
    titleMaxLength: 100,
    passwordMinLength: 8,
    passwordMaxLength: 50,
    descriptionMaxLength: 100,
    sectionTitleMaxLength: 200,
  },
  flightLeg: {
    airlineMaxLength: 100,
    flightNumberMaxLength: 30,
    airportMaxLength: 100,
    bookingReferenceMaxLength: 50,
    notesMaxLength: 1000,
  },
  accommodation: {
    nameMaxLength: 200,
    addressMaxLength: 500,
    bookingReferenceMaxLength: 50,
    contactNumberMaxLength: 30,
    notesMaxLength: 1000,
  },
  activity: {
    nameMaxLength: 200,
    locationMaxLength: 500,
    notesMaxLength: 1000,
  },
} as const
