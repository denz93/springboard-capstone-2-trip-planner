import { Client, LatLng, PlaceType1, TextSearchResponse } from '@googlemaps/google-maps-services-js';
const client = new Client({
    config: {
        headers: {
            Referer: 'http://localhost:3000'
        }
    }
})

export class GooglePlaceService {
    static apiKey: string = process.env.GOOGLE_MAP_API_KEY

    static async textSearch(textQuery: string) {
        let res: TextSearchResponse
        try {
            res = await client.textSearch({
                params: {
                    query: textQuery,
                    key: this.apiKey,

                },

            })

        } catch (err) {
            console.log(err)
            return []
        }
        if (res.status === 200) {
            return res.data.results
        }
        console.debug(`Status: ${res.status} - ${res.statusText}`)
        return []
    }

    static async nearBySearch(location: LatLng, placeType: PlaceType1 = PlaceType1.museum, radius = 500) {
        const res = await client.placesNearby({
            params: {
                location,
                radius,
                key: this.apiKey,
                type: placeType,

            }
        })
        if (res.status === 200) {
            return res.data.results
        }
        console.debug(`Status: ${res.status} - ${res.statusText}`)
        return []
    }

    static async getPlaceDetail(placeId: string) {
        const res = await client.placeDetails({
            params: {
                key: this.apiKey,
                place_id: placeId
            }
        })
        if (res.status === 200) {
            return res.data.result
        }
        console.debug(`Status: ${res.status} - ${res.statusText}`)
        return null
    }

}


