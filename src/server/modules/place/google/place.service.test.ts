import { test, expect } from 'vitest'
import { GooglePlaceService } from './place.service'
import { PlaceType1 } from '@googlemaps/google-maps-services-js'
test('Google text query', async () => {

    const data = await GooglePlaceService.textSearch("San Francisco")
    expect(data.length).toBeGreaterThan(0)
    expect(data[0].geometry).toBeDefined()
    expect(data[0].geometry?.location).toBeDefined()
})
test('Google nearby query', async () => {
    const city = await GooglePlaceService.textSearch("San Francisco",)

    const data = await GooglePlaceService.nearBySearch(city[0].geometry?.location as any, PlaceType1.museum, 5000)
    console.log(data)
    expect(data.length).toBeGreaterThan(0)

})