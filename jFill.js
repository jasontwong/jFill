/* vim: set expandtab sts=4 ts=4 sw=4 foldenable fdm=marker: */
(function($) {
    "use strict";
    $.fn.jFill = function(images, event_bind) {
        var container = this,
            slide = $('<div class="jFill-slide" />'),
            image = $('<img class="jFill-image" />'),
            image_holder = $('<div class="jFill-image-holder" />'),
            // {{{ create_slides(srcs)
            create_slides = function(srcs){
                var new_slide, i;
                for (i in srcs)
                {
                    if (srcs.hasOwnProperty(i))
                    {
                        new_slide = slide.clone(true);
                        container
                            .append(
                                new_slide
                                    .append(
                                        image_holder
                                            .clone(true)
                                            .append(
                                                image
                                                    .clone(true)
                                                    .data('slide', new_slide)
                                                    .attr('src', srcs[i])
                                            )
                                    )
                            );
                    }
                }
            },
            // }}}
            // {{{ resize_all_slides()
            resize_all_slides = function(){
                var slides = $(this).data('jfill_slides'),
                    i;
                if (typeof slides === 'object')
                {
                    for (i in slides)
                    {
                        if (slides.hasOwnProperty(i))
                        {
                            slides[i].trigger('resize_jfill');
                        }
                    }
                }
            },
            // }}}
            // {{{ resize_slide()
            resize_slide = function(){
                var el = $(this),
                    el_dims = {
                        height: el.data('height'),
                        width: el.data('width')
                    },
                    container_height = container.height(),
                    container_width = container.width(),
                    image = $('img', el),
                    image_dims = { 
                        height: 0, 
                        left: 0,
                        top: 0,
                        width: 0
                    },
                    image_ratio = el_dims.height / el_dims.width,
                    image_is_portrait = image_ratio > 1,
                    image_stretch_to_width = {
                        height: container_width * image_ratio,
                        width: container_width
                    },
                    image_stretch_to_height = {
                        height: container_height,
                        width: el_dims.width * (container_height / el_dims.height)
                    },
                    dim_diff = 0;
                // {{{ properly resize the image
                if (image_is_portrait)
                {
                    image_dims = image_stretch_to_height;
                }
                else 
                {
                    if ((container_height - el_dims.height) < (container_width - el_dims.width))
                    {
                        image_dims = image_stretch_to_height;
                        if (image_dims.width < container_width)
                        {
                            image_dims = image_stretch_to_width;
                        }
                    }
                    else
                    {
                        image_dims = image_stretch_to_width;
                        if (image_dims.height < container_height)
                        {
                            image_dims = image_stretch_to_height;
                        }
                    }
                }
                // }}}
                // {{{ properly position the image to work like background cover
                // calculate height / top offset
                dim_diff = container_height - image_dims.height;
                el_dims.height = image_dims.height;
                image_dims.top = 0;
                if (dim_diff < 0)
                {
                    image_dims.top = (dim_diff / 2);
                    el_dims.height = Math.abs(image_dims.height - Math.abs(dim_diff));
                }

                // calculate width / left offset
                dim_diff = container_width - image_dims.width;
                el_dims.width = image_dims.width;
                image_dims.left = 0;
                if (dim_diff < 0)
                {
                    image_dims.left = (dim_diff / 2);
                    el_dims.width = Math.abs(image_dims.width - Math.abs(dim_diff));
                }
                // }}}
                // apply dimensions to image element
                image.css(image_dims);

                // apply dimensions to slide element
                el.css(el_dims);
            };
            // }}}
        // {{{ slide setup
        slide
            .css({
                overflow: 'hidden'
            })
            .on({
                resize_jfill: resize_slide
            });
        // }}}
        // {{{ image setup
        image
            .css({
                position: 'absolute'
            })
            .on({
                load: function(){
                    var el = $(this),
                        slide = el.data('slide'),
                        slides = container.data('jfill_slides');
                    if (typeof slide === 'object')
                    {
                        slide
                            .data('height', el.height())
                            .data('width', el.width())
                            .trigger('resize_jfill');
                        if (typeof slides === 'undefined')
                        {
                            slides = [slide];
                        }
                        else
                        {
                            slides.push(slide);
                        }
                        container.data('jfill_slides', slides);
                    }
                }
            });
        // }}}
        // {{{ image_holder setup
        image_holder
            .css({
                position: 'relative'
            });
        // }}}
        if (typeof images === 'string')
        {
            create_slides([images]);
        }
        else if (typeof images === 'object')
        {
            create_slides(images);
        }
        else
        {
            $.error('Bad parameter passed to jQuery.jFill');
            return;
        }
        if (typeof event_bind === 'string')
        {
            return this.bind(event_bind, resize_all_slides);
        }
        return this;
    };
}(jQuery));
