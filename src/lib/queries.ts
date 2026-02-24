/**
 * GROQ query to fetch all brands from Sanity.
 *
 * Field name mapping (Sanity ASCII → Swedish interface):
 *   varumarke          → varumärke
 *   tillverkningslander → tillverkningsländer
 *   borsnoterat        → börsnoterat
 *   agare              → ägare
 *   agareLand          → ägareLand
 *
 * The `varumärken` list is computed automatically via inverse reference:
 * all brands that reference the same koncern document appear as siblings.
 * `ärHuvudvarumärke` is true for the brand whose _id matches the outer brand.
 */
export const ALL_BRANDS_QUERY = `
  *[_type == "brand"] | order(varumarke asc) {
    "id": _id,
    "varumärke": varumarke,
    "kategori": kategori,
    "tillverkadISverige": tillverkadISverige,
    "merInfo": {
      "moderbolag": coalesce(koncern->moderbolag, ""),
      "ägare": coalesce(koncern->agare, ""),
      "börsnoterat": borsnoterat,
      "tillverkningsländer": tillverkningslander,
      "intro": intro,
      "hallbarhetsFokus": hallbarhetsFokus,
      "koncernstruktur": {
        "moderbolag": koncern->moderbolag,
        "moderbolagLand": koncern->moderbolagLand,
        "ägare": koncern->agare,
        "ägareLand": koncern->agareLand,
        "varumärken": select(
          defined(koncern) => *[_type == "brand" && references(^.koncern._ref)] | order(varumarke asc) {
            "namn": varumarke,
            "land": brandLand,
            "ärHuvudvarumärke": _id == ^._id,
            "status": tillverkadISverige
          }
        )
      }
    }
  }
`
