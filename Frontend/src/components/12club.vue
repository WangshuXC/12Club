<template>
    <button data-text="Awesome" class="button">
        <span class="actual-text">&nbsp;12&nbsp;Club&nbsp;</span>
        <span class="hover-text" aria-hidden="true">&nbsp;12&nbsp;Club&nbsp;</span>
    </button>
</template>

<style>
.button {
    margin: 0;
    height: auto;
    background: transparent;
    padding: 0;
    border: none;
}

.button {
    --border-right: 6px;
    --text-stroke-color: var(--12club-color);
    --animation-color: var(--12club-light-color);
    --fs-size: 4em;
    margin-top: 5%;
    margin-bottom: 5%;
    letter-spacing: 0.5vw;
    text-decoration: none;
    font-size: var(--fs-size);
    position: relative;
    text-transform: uppercase;
    color: transparent;
    -webkit-text-stroke: 7px var(--text-stroke-color);
}

.hover-text {
    position: absolute;
    box-sizing: border-box;
    content: attr(data-text);
    color: var(--animation-color);
    width: 0%;
    inset: 0;
    border-right: var(--border-right) solid var(--animation-color);
    overflow: hidden;
    transition: 0.4s;
    -webkit-text-stroke: 8px var(--animation-color);
}

.button:hover .hover-text {
    width: 100%;
    filter: drop-shadow(0 0 23px var(--animation-color))
}
</style>