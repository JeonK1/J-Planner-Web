export const CONSTRAINTS = {
  plan: {
    titleMaxLength: 100,
    accessCodeMaxLength: 50,
    passwordMinLength: 4,
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
} as const
