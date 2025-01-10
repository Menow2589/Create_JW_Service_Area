// index.js

var lat = 40.499031;
var long = 141.50946;
var isCreateArea = false;
let latlng;
let polyline;
let map;
let lineWeight = 5;
let color = "black";
let polyline_id = [];
let polylines = [];

// GPS センサの値が変化したら何らか実行する geolocation.watchPosition メソッド
/*navigator.geolocation.watchPosition(
  (position) => {
    lat = position.coords.latitude; // 緯度を取得
    long = position.coords.longitude; // 経度を取得

    displayMap();
  },
  (error) => {
    // エラー処理（今回は特に何もしない）
    error;
  },
  {
    enableHighAccuracy: true, // 高精度で測定するオプション
  }
);*/

document.addEventListener('DOMContentLoaded', () => {
  map = L.map('map', {
  center: [lat, long],
  zoom: 15,
  zoomSnap: 0.4
});


  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  polyline = L.polyline([], { weight: lineWeight, color: color }).addTo(map);

  function handleMapClick(e) {
    latlng = e.latlng;
    polyline.addLatLng(latlng);
    if (
      polyline_id.length === 0 ||
      polyline_id[polyline_id.length - 1] !== polyline._leaflet_id
    ) {
      polyline_id.push(polyline._leaflet_id);
    }
  }

  map.on("click", handleMapClick);

  function decision() {
    console.log("確定");
    
    if (polyline && polyline.getLatLngs().length > 0) {
      // 現在のポリラインを配列に追加し、地図上にも残す
      const confirmedPolyline = L.polyline(polyline.getLatLngs(), {
        weight: lineWeight,
        color: color
      }).addTo(map);
      polylines.push(confirmedPolyline);
      
      // 現在のポリラインを地図から削除
      map.removeLayer(polyline);
      
      // 新しいポリラインを作成
      polyline = L.polyline([], {
        weight: lineWeight,
        color: color
      }).addTo(map);
    }

    // クリックイベントを更新
    map.off("click", handleMapClick);
    map.on("click", handleMapClick);
  }

  function clearPolylines() {
    console.log("クリア");

    // すべてのポリラインを削除
    [...polylines, polyline].forEach(poly => {
      if (poly) {
        map.removeLayer(poly);
      }
    });

    // 配列をクリア
    polylines = [];
    polyline_id = [];

    // 新しいポリラインを作成
    polyline = L.polyline([], {
      weight: lineWeight,
      color: color
    }).addTo(map);

    // クリックイベントを更新
    map.off("click", handleMapClick);
    map.on("click", handleMapClick);
  }

  // キャプチャボタンのイベントリスナー
  document.getElementById("capture-btn").addEventListener("click", function () {
    isDialogOpen = true;
    
    // すべてのポリラインを含めてキャプチャ
    leafletImage(map, function (err, canvas) {
      if (err) {
        console.error(err);
        return;
      }

      const ctx = canvas.getContext("2d");

      // 確定済みのポリラインを描画
      polylines.forEach(poly => {
        if (poly && poly.getLatLngs().length > 0) {
          ctx.strokeStyle = poly.options.color;
          ctx.lineWidth = poly.options.weight;
          
          const latlngs = poly.getLatLngs();
          ctx.beginPath();
          latlngs.forEach((latlng, index) => {
            const point = map.latLngToContainerPoint(latlng);
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        }
      });

      // 現在描画中のポリラインも描画
      if (polyline && polyline.getLatLngs().length > 0) {
        ctx.strokeStyle = polyline.options.color;
        ctx.lineWidth = polyline.options.weight;
        
        const latlngs = polyline.getLatLngs();
        ctx.beginPath();
        latlngs.forEach((latlng, index) => {
          const point = map.latLngToContainerPoint(latlng);
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }

      // キャンバスから画像データを取得
      imgData = canvas.toDataURL("image/png", 0.8);
      imgElement = document.getElementById("captured-image");
      imgElement.src = imgData;
      imgElement.style.display = "block";
    });
  });

  // グローバルスコープで関数を利用できるようにする
  window.decision = decision;
  window.clearPolylines = clearPolylines;
});
