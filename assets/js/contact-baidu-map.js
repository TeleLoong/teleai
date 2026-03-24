(function () {
  const MAP_CONTAINER_ID = "contact-baidu-map";
  const MAP_FALLBACK_ID = "contact-baidu-map-fallback";
  const BAIDU_MAP_SCRIPT_ID = "baidu-map-jsapi-gl";
  const SHANGHAI_FALLBACK_POINT = { lng: 121.4737, lat: 31.2304 };

  let baiduMapScriptPromise;

  function logWarning(message, error) {
    console.warn("[contact-baidu-map]", message, error || "");
  }

  function getAddressCity(address) {
    const match = (address || "").match(/(.+?(?:市|地区|自治州|盟))/);
    return match ? match[1] : "";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[char] || char;
    });
  }

  function loadBaiduMapScript(ak) {
    if (window.BMapGL) {
      return Promise.resolve(window.BMapGL);
    }

    if (baiduMapScriptPromise) {
      return baiduMapScriptPromise;
    }

    baiduMapScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(BAIDU_MAP_SCRIPT_ID);

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.BMapGL));
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Baidu Maps script")));
        return;
      }

      const script = document.createElement("script");
      script.id = BAIDU_MAP_SCRIPT_ID;
      script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(ak)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.BMapGL) {
          resolve(window.BMapGL);
          return;
        }

        reject(new Error("BMapGL is unavailable after the script finished loading"));
      };
      script.onerror = () => reject(new Error("Failed to load Baidu Maps script"));
      document.head.appendChild(script);
    }).catch((error) => {
      baiduMapScriptPromise = null;
      throw error;
    });

    return baiduMapScriptPromise;
  }

  function revealInteractiveMap(mapContainer, fallback) {
    mapContainer.classList.remove("is-hidden");
    if (fallback) {
      fallback.classList.add("is-hidden");
    }
  }

  function initContactMap() {
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);

    if (!mapContainer) {
      return;
    }

    const fallback = document.getElementById(MAP_FALLBACK_ID);
    const ak = (mapContainer.dataset.mapAk || "").trim();
    const address = (mapContainer.dataset.mapAddress || "").trim();
    const title = (mapContainer.dataset.mapTitle || "").trim();
    const zoom = Number.parseInt(mapContainer.dataset.mapZoom || "", 10) || 18;

    if (!ak) {
      logWarning("Skipped interactive map initialization because the Baidu AK is missing.");
      return;
    }

    if (!address) {
      logWarning("Skipped interactive map initialization because the address is missing.");
      return;
    }

    loadBaiduMapScript(ak)
      .then((BMapGL) => {
        const map = new BMapGL.Map(mapContainer, {
          enableMapClick: false,
        });
        const initialPoint = new BMapGL.Point(SHANGHAI_FALLBACK_POINT.lng, SHANGHAI_FALLBACK_POINT.lat);

        map.centerAndZoom(initialPoint, zoom);
        map.enableDragging();
        map.enableScrollWheelZoom();
        map.enableContinuousZoom();
        map.addControl(new BMapGL.NavigationControl());
        map.addControl(new BMapGL.ScaleControl());

        const geocoder = new BMapGL.Geocoder();
        const city = getAddressCity(address);

        geocoder.getPoint(
          address,
          (point) => {
            if (!point) {
              logWarning(`Geocoding did not return a result for address: ${address}`);
              return;
            }

            map.clearOverlays();
            map.centerAndZoom(point, zoom);
            const marker = new BMapGL.Marker(point);
            map.addOverlay(marker);

            if (title) {
              const infoWindow = new BMapGL.InfoWindow(
                `<strong>${escapeHtml(title)}</strong><div style="margin-top:0.35rem;">${escapeHtml(address)}</div>`
              );
              map.openInfoWindow(infoWindow, point);
              marker.addEventListener("click", () => {
                map.openInfoWindow(infoWindow, point);
              });
            }

            revealInteractiveMap(mapContainer, fallback);
          },
          city
        );
      })
      .catch((error) => {
        logWarning("Interactive Baidu map initialization failed.", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactMap, { once: true });
  } else {
    initContactMap();
  }
})();
