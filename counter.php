<!DOCTYPE html>
<html>
    <head><meta charset="UTF-8"></head>
<div id="visitors">Loading...</div>

<script>
fetch("https://ip-counter-xxxxx.onrender.com")
  .then(r => r.json())
  .then(d => {
    document.getElementById("visitors").textContent =
      "ユニーク訪問者数: " + d.uniqueVisitors;
  });
</script>
</html>
