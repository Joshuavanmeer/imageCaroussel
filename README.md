# imageCaroussel



<p>
A simple responsive image caroussel, will be updated with a few more features in the coming days
</p>
<h2>How to use</h2>
<p>Create a new instance. This returns a new instance through a factory function</p>
<pre>
<code>
var sweetSlider = caroussel.create({
  speed: 1
});
</code>
</pre>

<h2>How to add slides</h2>
<p>Add slides through an array of objects</p>
<pre>
<code>
sweetSlider.addSlide([
    {
        url: 'img/img1.jpg',
        desc: 'A photo of some landscape'
    },
    {
        url: 'img/img2.jpg',
        desc: 'A photo of some landscape'
    },
    {
        url: 'img/img3.jpg',
        desc: 'A photo of some landscape'
    },
    {
        url: 'img/img1.jpg',
        desc: 'A photo of some landscape'
    }
]);

</code>
</pre>
