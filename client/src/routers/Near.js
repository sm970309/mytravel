/* global kakao */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"

const Near = () => {
    const { state } = useLocation();
    const [address, setAddress] = useState('');
    const bounds = new kakao.maps.LatLngBounds();
    const geocoder = new kakao.maps.services.Geocoder();
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords
            geocoder.coord2RegionCode(longitude, latitude, (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    setAddress(result[0].region_1depth_name + " " + result[0].region_2depth_name)
                }
            }
            )
        })

        const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567),
            level: 9,
        }

        const displayMarker = (place) => {
            // 마커를 생성하고 지도에 표시합니다
            const point = new kakao.maps.LatLng(place.y, place.x)
            const marker = new kakao.maps.Marker({
                map: map,
                position: point
            })
            bounds.extend(point)
            kakao.maps.event.addListener(marker, 'click', () => {
                // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
                infowindow.setContent(`<a href=${place.place_url}>${place.place_name}</div>`);
                infowindow.open(map, marker);
            });

        };

        const placesSearchCB = (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                for (let i = 0; i < data.length; i++) {
                    displayMarker(data[i]);
                }
                map.setBounds(bounds);
            }
            else {
                console.log('error')
            }

        }

        const map = new kakao.maps.Map(container, options)
        const places = new kakao.maps.services.Places();
        places.setMap(map)

        // 키워드로 검색 -> AD5: 숙박
        if (address) {
            places.keywordSearch(state ? state : address, placesSearchCB, {
                category_group_code: 'AD5'
            });
        }
        kakao.maps.event.addListener(map, 'click', () => {
            infowindow.close()
        })
    }, [state, address])

    return (
        <div>
            {state ?
                <h2>Searching For {state}...</h2> :
                <h2>Searching For Nerby...</h2>
            }
            <div>
                <div id='map' style={{ width: '100%', height: "600px" }}></div>
            </div>
        </div>

    )
}

export default Near