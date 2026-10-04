# 人物辨識相機

這是一個手機瀏覽器可用的原型 App。它會開啟相機，使用 COCO-SSD 模型偵測畫面中的 `person`，並即時框出位置。

## 使用方式

1. 用 HTTPS 網站部署這個資料夾，或在開發時使用 `localhost`。
2. 開啟 `index.html`。
3. 點選「開啟相機」，允許相機權限。

手機瀏覽器通常不允許一般 `http://區網 IP` 使用相機；若要用手機測試，建議部署到 HTTPS，或用支援 HTTPS tunnel 的工具。

## GitHub Pages 部署

1. 將此專案推送到 GitHub repository。
2. 到 repository 的 `Settings` > `Pages`。
3. `Build and deployment` 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/root`，儲存後等待 GitHub 發佈。

## 注意

這個版本是「人物偵測」，不是臉部或身分辨識。若要做員工、會員或特定人士辨識，需要額外的同意流程、資料保護設計與專屬模型。
