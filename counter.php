<!DOCTYPE html>
<html　lang="ja">
    <head><meta charset="UTF-8"></head>
    <body>
<div id="visitors">Loading...</div>

<script>
fetch("https://wool-counter.onrender.com/")
  .then(r => r.json())
  .then(d => {
    document.getElementById("visitors").textContent =
      "ユニーク訪問者数: " + d.uniqueVisitors;
  });
</script>
    </body>
</html>
