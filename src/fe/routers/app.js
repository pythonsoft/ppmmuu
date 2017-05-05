import Vue from 'vue';
import VueRouter from 'vue-router';
import '../css/base.css'

Vue.use(VueRouter);

const Home = { template: '<div>Home</div>' };
// const Page1 = resolve => require(['./page1/index.vue'], resolve);
const Page1 = resolve => require.ensure([], () => resolve(require('./page1/index.vue')), 'page1');
const SubPage1 = resolve => require.ensure([], () => resolve(require('./page1/sub/sub_index.vue')), 'page1');

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Home },
    { path: '/page1', component: Page1,
      children: [
        { path: 'sub', component: SubPage1 }
      ]
    }
  ]
});

new Vue({
  router,
  template: `
    <div id="app">
      <ul>
        <li><router-link to="/">/</router-link></li>
        <li><router-link to="/page1">/page1</router-link></li>
        <li><router-link to="/page1/sub">/page1/sub</router-link></li>
      </ul>
      <router-view class="view"></router-view>
    </div>
  `
}).$mount('#app')
