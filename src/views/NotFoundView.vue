<template>
  <div className="not-found">
    <div className="not-found__wrapper">
      <div className="not-found__img">
        <img src="@/assets/notfound.png" alt="" />
      </div>
      <div className="not-found__content">
        <h3 className="not-found__heading">we lost that page</h3>
        <p className="not-found__description">
          Sorry , the page you`re looking for doesn`t exist
        </p>
        <BaseButton @click="router.push('/')"> back to dashboard </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "NotFoundPage",
  setup() {
    const router = useRouter();
    return {
      router,
    };
  },
};
</script>

<style lang="scss" scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  &__wrapper {
    max-width: 560px;
    width: 540px;
    padding: 16px;
    border-radius: 5px;
    @media screen and (max-width: 576px) {
      width: 100%;
    }
  }

  &__content {
    text-align: center;
  }

  &__heading {
    text-transform: capitalize;
    font-size: 2rem;
    color: var(--blue-500);
  }

  &__description {
    font-size: 1.6rem;
    color: var(--gray-500);
    margin-block: 5px 40px;
  }

  &__link {
    display: block;
    width: max-content;
    margin-inline: auto;
    padding-block: 10px;
    padding-inline: 30px;
    border-radius: 8px;
    color: #fff;
    background-color: #1a5fff;
    text-transform: capitalize;
    font-size: 1.8rem;
  }
}
</style>
