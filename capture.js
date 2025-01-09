//capture.js

//captureMode(0:縦 || 1:横)
let captureMode = 0;
let areaNumber = null;

document.addEventListener("DOMContentLoaded", () => {
  const captureArea = document.getElementById("capture-area");
  const startButton = document.getElementById("start-capture");
  const areaNo = document.getElementById("area-no");
  let isCapturing = false;
  let startX, startY;

  startButton.addEventListener("click", () => {
    areaNumber = areaNo.value.trim(); // 前後の空白を削除

    // 入力値の検証
    if (!areaNumber) {
      alert("区域番号を入力してください");
      return;
    }

    isCapturing = true;
    document.body.style.cursor = "crosshair";
    console.log("区域番号: " + areaNumber);
  });

  document.addEventListener("mousemove", (e) => {
    if (captureMode === 0) {
      if (!isCapturing || !startX) return;
      const width = e.clientX - startX;
      const height = (e.clientX - startX) * 1.414;
      captureArea.style.width = `${Math.abs(width)}px`;
      captureArea.style.height = `${Math.abs(height)}px`;
      captureArea.style.left = `${width < 0 ? e.clientX : startX}px`;
      captureArea.style.top = `${height < 0 ? e.clientY : startY}px`;
    } else if (captureMode === 1) {
      if (!isCapturing || !startX) return;
      const width = (e.clientY - startY) * 1.414;
      const height = e.clientY - startY;
      captureArea.style.width = `${Math.abs(width)}px`;
      captureArea.style.height = `${Math.abs(height)}px`;
      captureArea.style.left = `${width < 0 ? e.clientX : startX}px`;
      captureArea.style.top = `${height < 0 ? e.clientY : startY}px`;
    } else {
      console.log("error");
      return 0;
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (!isCapturing) return;
    startX = e.clientX - favDialog.getBoundingClientRect().left; // ダイアログ内の位置を考慮
    startY = e.clientY - favDialog.getBoundingClientRect().top;
    captureArea.style.left = `${startX}px`;
    captureArea.style.top = `${startY}px`;
    captureArea.style.width = "0px";
    captureArea.style.height = "0px";
    captureArea.style.display = "block";
  });

  document.addEventListener("mouseup", () => {
    if (!isCapturing || !startX) return;
    isCapturing = false;
    document.body.style.cursor = "default";

    const rect = captureArea.getBoundingClientRect();
    const dialogRect = favDialog.getBoundingClientRect();

    // 選択範囲をダイアログ内の座標に変換
    const captureRect = {
      left: rect.left - dialogRect.left,
      top: rect.top - dialogRect.top,
      width: rect.width,
      height: rect.height,
    };



    // html2canvasでキャプチャを実行
    html2canvas(favDialog, {
      useCORS: true,
      x: captureRect.left,
      y: captureRect.top,
      width: captureRect.width,
      height: captureRect.height,
      scale: 1,
      logging: false,
      backgroundColor: null,
      imageTimeout: 0,
      removeContainer: true
    }).then((canvas) => {
      // FHDサイズ用の新しいキャンバスを作成
      const fhdCanvas = document.createElement('canvas');
      const fhdCtx = fhdCanvas.getContext('2d');
      
      // アスペクト比を維持しながらFHDサイズにリサイズ
      const aspectRatio = canvas.width / canvas.height;
      let targetWidth, targetHeight;
      
      if (aspectRatio > 16/9) {
        // 横長の場合
        targetWidth = 1920;
        targetHeight = Math.round(1920 / aspectRatio);
      } else {
        // 縦長の場合
        targetHeight = 1080;
        targetWidth = Math.round(1080 * aspectRatio);
      }
      
      // FHDキャンバスのサイズを設定
      fhdCanvas.width = targetWidth;
      fhdCanvas.height = targetHeight;
      
      // 画質を維持するためのイメージスムージングを設定
      fhdCtx.imageSmoothingEnabled = true;
      fhdCtx.imageSmoothingQuality = 'high';
      
      // リサイズして描画
      fhdCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

      // テキストの設定と描画
      fhdCtx.font = 'bold 48px Arial';  // フォントサイズとスタイルを設定
      fhdCtx.fillStyle = 'black';         // テキストの色を設定
      fhdCtx.strokeStyle = 'white';     // テキストの縁取りの色を設定
      fhdCtx.lineWidth = 2;             // テキストの縁取りの太さを設定
      
      // テキストを描画（左上に配置、マージンは20px）
      fhdCtx.strokeText(areaNumber, 20, 48);  // 縁取りを描画
      fhdCtx.fillText(areaNumber, 20, 48);    // テキストを描画
      
      // 画像として保存
      fhdCanvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.download = "capture.jpg";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/jpeg", 0.9); // 高品質なJPEGとして保存
    });

    captureArea.style.display = "none";
    startX = startY = null;
    //resetImg();
  });
});
