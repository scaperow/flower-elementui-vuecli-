<template>
  <div class="body">

    <div class="error">
      <h1>403</h1>
      <p>没有权限访问</p>
      <i class="iconfont icon-cry"></i><br>
      <p>回到<a href="/">首页 &rarr;</a></p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.body {
  background-color: #f4f4f4;
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  .error {
    text-align: center;
    margin-top: 4%;
  }
  h1 {
    font-size: 3rem;
    font-weight: 900;
    font-family: "Luckiest Guy", cursive;
    letter-spacing: 0.9rem;
    background: -webkit-linear-gradient(#666, black);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    font-size: 1.5rem;
    font-family: "Maven Pro", sans-serif;
    letter-spacing: 0.3rem;
  }
  i {
    font-size: 8rem;
    color: red;
  }

  a {
    color: #666;
    animation: pulse 2s infinite;
    text-decoration: none;
    border-bottom: 1px solid #55c57a;
    transition: all 0.8s;
  }
  a:hover {
    opacity: 0.8;
    color: white;
    background-color: #55c57a;
  }
  .green {
    color: green;
  }
}
</style>


