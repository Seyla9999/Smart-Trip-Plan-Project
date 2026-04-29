<template>
<div class="plan-trip">
<header class="header">
<div class="container">
<div class="link">
<div class="background">
<div class="logo">
<div class="text-wrapper">តោះទៅ</div>
<div class="div">Cambodia</div>
<img class="book" alt="Book" src="/logo.png" />
</div>
</div>
<div class="margin">
<div class="text-wrapper-2">តោះទៅ! Cambodia</div>
</div>
</div>
<div class="nav">
<div class="div-2">
<div class="text-wrapper-3">Home</div>
</div>
<div class="link-margin">
<div class="div-2">
<div class="text-wrapper-3">About</div>
</div>
</div>
<div class="link-margin">
<div class="div-2">
<div class="text-wrapper-3">Discover</div>
</div>
</div>
<div class="link-margin">
<div class="div-2">
<div class="text-wrapper-3">Plan Trip</div>
</div>
</div>
<div class="link-margin">
<div class="div-2">
<div class="text-wrapper-3">Map</div>
</div>
</div>
<div class="link-margin">
<div class="div-2">
<div class="text-wrapper-3">Community</div>
</div>
</div>
</div>
<div class="container-2">
<CommonButtonLight
            class="common-button-light-instance"
            div-class-name="design-component-instance-node"
            property1="default"
            text="Login"
          />
<CommonButtonLight
            class="common-button-light-2"
            div-class-name="common-button-light-3"
            property1="default"
            text="Sign Up Free"
          />
</div>
</div>
</header>
<div class="hero-section">
<div class="container-3">
<div class="angkor-wat-at"></div>
<div class="overlay"></div>
</div>
<div class="container-4">
<div class="container-5">
<div class="div-wrapper">
<div class="text-wrapper-4">The Kingdom Awaits</div>
</div>
<div class="div-wrapper">
<p class="curating">
Curating extraordinary journeys through Cambodia's imperial heritage.
            </p>
</div>
</div>
<div class="section-search">
<div class="overlay-border">
<div class="container-6">
<div class="div-2">
<div class="container-7">
<div class="journey-begins">JOURNEY BEGINS</div>
</div>
<div class="container-7">
<div class="text-wrapper-5">Phnom Penh</div>
</div>
</div>
<div class="vertical-divider"></div>
<div class="container-8">
<div class="container-7">
<div class="text">DESTINATION</div>
</div>
<div class="container-7">
<div class="text-2">Koh Kong</div>
</div>
</div>
<div class="vertical-divider"></div>
<div class="container-9">
<div class="container-7">
<div class="text-3">TRAVEL DATES</div>
</div>
<div class="container-7">
<p class="p">Dec 20 – Dec 22</p>
</div>
</div>
<div class="vertical-divider"></div>
<div class="container-10">
<div class="container-7">
<div class="text-4">TRAVEL TYPE</div>
</div>
<div class="container-7">
<div class="text-5">Friends</div>
</div>
</div>
</div>
<div class="button-wrapper">
<button class="button-2" type="button">
<div class="text-wrapper-6">Search</div>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
</template>
<script>
import CommonButtonLight from "./CommonButtonLight.vue";

export default {
  name: "PlanTrip",
  components: {
    CommonButtonLight,
  },
  props: {},
};
</script>
<style scoped>
.plan-trip {
  background-color: #fbf9f4;
  min-height: 676px;
  min-width: 1440px;
  position: relative;
  width: 100%;
}

.plan-trip .header {
  -webkit-backdrop-filter: blur(4px) brightness(100%);
  align-items: flex-start;
  backdrop-filter: blur(4px) brightness(100%);
  background-color: #141b3e;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: #e7e2da;
  border-left-style: none;
  border-right-style: none;
  border-top-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
  left: 0;
  padding: 0px 20px 1px;
  position: absolute;
  top: 0;
  width: 100%;
}

.plan-trip .container {
  align-items: center;
  display: flex;
  height: 64px;
  justify-content: space-between;
  max-width: 1400px;
  padding: 0px 16.02px 0px 16px;
  position: relative;
  width: 100%;
}

.plan-trip .link {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  position: relative;
}

.plan-trip .background {
  align-items: center;
  border: 0.5px solid;
  border-color: #ffffff;
  border-radius: var(--shape-corner-full);
  display: flex;
  height: 40px;
  justify-content: space-between;
  position: relative;
  width: 40px;
}

.plan-trip .logo {
  border-radius: 20px;
  height: 40px;
  position: relative;
  width: 40px;
}

.plan-trip .text-wrapper {
  align-items: center;
  color: #5a76f0;
  display: flex;
  font-family: "Carrois Gothic-Regular", Helvetica;
  font-size: 9px;
  font-weight: 400;
  height: 11px;
  left: calc(50.00% - 12px);
  letter-spacing: 0;
  line-height: normal;
  position: absolute;
  top: calc(50.00% + 3px);
}

.plan-trip .div {
  -webkit-text-stroke: 0.2px #395fab;
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Jaro-Regular", Helvetica;
  font-size: 5px;
  font-weight: 400;
  height: 3px;
  left: calc(50.00% - 10px);
  letter-spacing: 0;
  line-height: normal;
  position: absolute;
  text-shadow: 0px 4px 4px #00000040;
  top: 33px;
  white-space: nowrap;
}

.plan-trip .book {
  height: 20px;
  left: 5px;
  object-fit: cover;
  position: absolute;
  top: 5px;
  width: 30px;
}

.plan-trip .margin {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 0px 0px 0px 8px;
  position: relative;
}

.plan-trip .text-wrapper-2 {
  -webkit-text-stroke: 1px #125700;
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Inter-Bold", Helvetica;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 28px;
  margin-left: -1px;
  margin-top: -2px;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.plan-trip .nav {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 20px;
  position: relative;
}

.plan-trip .div-2 {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
}

.plan-trip .text-wrapper-3 {
  align-items: center;
  color: #ffffffcc;
  display: flex;
  font-family: "Inter-Medium", Helvetica;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 20px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.plan-trip .link-margin {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 0px 0px 0px 24px;
  position: relative;
}

.plan-trip .container-2 {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 30px;
  max-width: 448px;
  position: relative;
}

.plan-trip .common-button-light-instance {
  border-radius: 10px !important;
  display: flex !important;
  height: 40px !important;
  left: unset !important;
  top: unset !important;
  width: 100px !important;
}

.plan-trip .design-component-instance-node {
  font-family: "Quicksand-Medium", Helvetica !important;
  font-size: 16px !important;
  font-style: unset !important;
  font-weight: 500 !important;
  letter-spacing: 0.32px !important;
  line-height: 24px !important;
  margin-bottom: -8px !important;
  margin-left: -19.5px !important;
  margin-right: -19.5px !important;
  margin-top: -12px !important;
}

.plan-trip .common-button-light-2 {
  background-color: #4a66e3 !important;
  border-radius: 10px !important;
  display: flex !important;
  height: 40px !important;
  left: unset !important;
  top: unset !important;
  width: 120px !important;
}

.plan-trip .common-button-light-3 {
  color: #ffffff !important;
  font-family: "Quicksand-Medium", Helvetica !important;
  font-size: 16px !important;
  font-style: unset !important;
  font-weight: 500 !important;
  letter-spacing: 0.32px !important;
  line-height: 24px !important;
  margin-bottom: -8px !important;
  margin-left: -37.5px !important;
  margin-right: -37.5px !important;
  margin-top: -12px !important;
}

.plan-trip .hero-section {
  align-items: center;
  display: flex;
  height: 612px;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 64px;
  width: 100%;
}

.plan-trip .container-3 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.plan-trip .angkor-wat-at {
  align-self: stretch;
  background-image: url('/hero/hero1.jpg');
  background-position: 50% 50%;
  background-size: cover;
  flex: 1;
  flex-grow: 1;
  position: relative;
  width: 100%;
}

.plan-trip .overlay {
  background-color: #0000004c;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.plan-trip .container-4 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 45px;
  max-width: 1024px;
  padding: 0px 31px 0px 40px;
  position: relative;
  width: 1024px;
}

.plan-trip .container-5 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 16px;
  margin-bottom: -19px;
  position: relative;
  width: 100%;
}

.plan-trip .div-wrapper {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.plan-trip .text-wrapper-4 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Noto Serif-ExtraBold", Helvetica;
  font-size: 32px;
  font-weight: 800;
  height: 24px;
  justify-content: center;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: 571px;
}

.plan-trip .curating {
  align-items: center;
  align-self: stretch;
  color: #ffffffe6;
  display: flex;
  font-family: "Inter-Regular", Helvetica;
  font-size: 24px;
  font-weight: 400;
  height: 24px;
  justify-content: center;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
}

.plan-trip .section-search {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 10px;
  margin-bottom: -179px;
  margin-right: -54px;
  padding: 32px 0px;
  position: relative;
}

.plan-trip .overlay-border {
  -webkit-backdrop-filter: blur(6px) brightness(100%);
  align-items: center;
  backdrop-filter: blur(6px) brightness(100%);
  background-color: #ffffff2b;
  border: 1px solid;
  border-color: #ffffff;
  border-radius: 9999px;
  display: flex;
  height: 80px;
  justify-content: space-between;
  padding: 13px 33px;
  position: relative;
  width: 1007px;
}

.plan-trip .container-6 {
  align-items: center;
  display: flex;
  gap: 32px;
  position: relative;
  width: 597px;
}

.plan-trip .container-7 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.plan-trip .journey-begins {
  align-items: center;
  color: #ffffff99;
  display: flex;
  font-family: "Plus Jakarta Sans-Bold", Helvetica;
  font-size: 10px;
  font-weight: 700;
  height: 15px;
  letter-spacing: 1px;
  line-height: 15px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 114px;
}

.plan-trip .text-wrapper-5 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Plus Jakarta Sans-Medium", Helvetica;
  font-size: 16px;
  font-weight: 500;
  height: 24px;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 113px;
}

.plan-trip .vertical-divider {
  background-color: #ffffff33;
  height: 32px;
  position: relative;
  width: 1px;
}

.plan-trip .container-8 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 110px;
}

.plan-trip .text {
  align-items: center;
  color: #ffffff99;
  display: flex;
  font-family: "Plus Jakarta Sans-Bold", Helvetica;
  font-size: 10px;
  font-weight: 700;
  height: 15px;
  letter-spacing: 1px;
  line-height: 15px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 77.47px;
}

.plan-trip .text-2 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Plus Jakarta Sans-Medium", Helvetica;
  font-size: 16px;
  font-weight: 500;
  height: 24px;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 73.36px;
}

.plan-trip .container-9 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 157px;
}

.plan-trip .text-3 {
  align-items: center;
  color: #ffffff99;
  display: flex;
  font-family: "Plus Jakarta Sans-Bold", Helvetica;
  font-size: 10px;
  font-weight: 700;
  height: 15px;
  letter-spacing: 1px;
  line-height: 15px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 82.39px;
}

.plan-trip .p {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Plus Jakarta Sans-Medium", Helvetica;
  font-size: 16px;
  font-weight: 500;
  height: 24px;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 123.63px;
}

.plan-trip .container-10 {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  margin-right: -53.28px;
  position: relative;
}

.plan-trip .text-4 {
  align-items: center;
  color: #ffffff99;
  display: flex;
  font-family: "Plus Jakarta Sans-Bold", Helvetica;
  font-size: 10px;
  font-weight: 700;
  height: 15px;
  letter-spacing: 1px;
  line-height: 15px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 74.28px;
}

.plan-trip .text-5 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Plus Jakarta Sans-Medium", Helvetica;
  font-size: 16px;
  font-weight: 500;
  height: 24px;
  letter-spacing: 0;
  line-height: 24px;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: 56.23px;
}

.plan-trip .button-wrapper {
  all: unset;
  align-items: center;
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 16px;
  position: relative;
}

.plan-trip .button-2 {
  all: unset;
  align-items: center;
  background-color: #097445;
  border-radius: 9999px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 32px;
  position: relative;
  width: 147px;
}

.plan-trip .text-wrapper-6 {
  align-items: center;
  color: #a8e7c5;
  display: flex;
  font-family: "Plus Jakarta Sans-Bold", Helvetica;
  font-size: 16px;
  font-weight: 700;
  height: 24px;
  justify-content: center;
  letter-spacing: 0;
  line-height: 24px;
  margin-left: -17px;
  margin-right: -17px;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: 117px;
}
</style>