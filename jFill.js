/* vim: set expandtab sts=4 ts=4 sw=4 foldenable fdm=marker: */
(function($) {
    "use strict";
    $.fn.jFill = function(options) {
        var i,
            container = this,
            slide = $('<div class="jFill-slide" />'),
            image = $('<img class="jFill-image" />'),
            image_holder = $('<div class="jFill-image-holder" />'),
            // {{{ get_best_size(sizes, dims)
            get_best_size = function(sizes, dims){
                var default_src = '',
                    has_gte_width = false,
                    has_lte_width = false,
                    src = '',
                    i;
                // currently priority is based on ordering
                for (i in sizes)
                {
                    if (sizes.hasOwnProperty(i) && sizes[i].hasOwnProperty('src'))
                    {
                        has_lte_width = sizes[i].hasOwnProperty('lte_width');
                        has_gte_width = sizes[i].hasOwnProperty('gte_width');
                        if (has_lte_width)
                        {
                            src = dims.width <= sizes[i].lte_width
                                ? sizes[i].src
                                : '';
                            if (has_gte_width)
                            {
                                src = src.length && dims.width >= sizes[i].gte_width
                                    ? sizes[i].src
                                    : '';
                            }
                        }
                        else if (has_gte_width)
                        {
                            src = dims.width >= sizes[i].gte_width
                                ? sizes[i].src
                                : '';
                        }
                        else
                        {
                            default_src = sizes[i].src;
                        }
                        if (src.length)
                        {
                            break;
                        }
                    }
                }
                return src === '' ? default_src : src;
            },
            // }}}
            // {{{ create_slides(srcs)
            create_slides = function(srcs){
                var new_slide, 
                    sizes, 
                    src, 
                    i, 
                    container_dims;
                for (i in srcs)
                {
                    if (srcs.hasOwnProperty(i))
                    {
                        new_slide = slide.clone(true);
                        src = sizes = srcs[i];
                        if (typeof sizes === 'object')
                        {
                            container_dims = {
                                height: container.height(),
                                width: container.width()
                            };
                            src = get_best_size(sizes, container_dims);
                            new_slide
                                .data('sizes', sizes)
                                .data('srcs', [src]);
                        }
                        // {{{ add image to dom if src is string
                        if (typeof src === 'string')
                        {
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
                                                        .attr('src', src)
                                                )
                                        )
                                );
                        }
                        // }}}
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
                // {{{ data prep
                var el = $(this),
                    el_dims = {
                        height: el.data('height'),
                        width: el.data('width')
                    },
                    el_sizes = el.data('sizes'),
                    el_srcs = el.data('srcs'),
                    container_dims = {
                        height: container.height(),
                        width: container.width()
                    },
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
                        height: container_dims.width * image_ratio,
                        width: container_dims.width
                    },
                    image_stretch_to_height = {
                        height: container_dims.height,
                        width: el_dims.width * (container_dims.height / el_dims.height)
                    },
                    dim_diff = 0,
                    new_src = '';
                // }}}
                // {{{ properly resize the image
                if (image_is_portrait)
                {
                    image_dims = image_stretch_to_height;
                }
                else 
                {
                    if ((container_dims.height - el_dims.height) < (container_dims.width - el_dims.width))
                    {
                        image_dims = image_stretch_to_height;
                        if (image_dims.width < container_dims.width)
                        {
                            image_dims = image_stretch_to_width;
                        }
                    }
                    else
                    {
                        image_dims = image_stretch_to_width;
                        if (image_dims.height < container_dims.height)
                        {
                            image_dims = image_stretch_to_height;
                        }
                    }
                }
                // }}}
                // {{{ properly position the image to work like background cover
                // calculate height / top offset
                dim_diff = container_dims.height - image_dims.height;
                el_dims.height = image_dims.height;
                image_dims.top = 0;
                if (dim_diff < 0)
                {
                    image_dims.top = (dim_diff / 2);
                    el_dims.height = Math.abs(image_dims.height - Math.abs(dim_diff));
                }

                // calculate width / left offset
                dim_diff = container_dims.width - image_dims.width;
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

                // update the src with the best image
                if ($.type(el_sizes) === 'array')
                {
                    new_src = get_best_size(
                        el_sizes,
                        { 
                            height: container_dims.height,
                            width: container_dims.width
                        }
                    );
                    if (new_src !== image.attr('src'))
                    {
                        image.attr('src', new_src);
                        if ($.inArray(new_src, el_srcs))
                        {
                            el.trigger('resize_jfill');
                        }
                        else
                        {
                            el_srcs.push(new_src);
                            el.data('srcs', el_srcs);
                        }
                    }
                }
            };
            // }}}
        // {{{ container setup
        container
            .css({
                overflow: 'hidden'
            });
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
            .data('loaded', false)
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
                        if (!el.data('loaded'))
                        {
                            if (typeof slides === 'undefined')
                            {
                                slides = [slide];
                            }
                            else
                            {
                                slides.push(slide);
                            }
                            container.data('jfill_slides', slides);
                            el.data('loaded', true);
                        }
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
        if (typeof options === 'string')
        {
            create_slides([options]);
        }
        else if (typeof options === 'object')
        {
            if (options.hasOwnProperty('images') && $.type(options.images) === 'array')
            {
                create_slides(options.images);
                // {{{ add event bindings
                if (options.hasOwnProperty('event_binds'))
                {
                    if (typeof options.event_binds === 'string')
                    {
                        this.bind(options.event_binds, resize_all_slides);
                    }
                    else if ($.type(options.event_binds) === 'array')
                    {
                        for (i in options.event_binds)
                        {
                            if (options.event_binds.hasOwnProperty(i))
                            {
                                this.bind(options.event_binds[i], resize_all_slides);
                            }
                        }
                    }
                }
                // }}}
            }
            else
            {
                $.error('Missing/bad images key');
            }
        }
        else
        {
            $.error('Bad parameter passed to jQuery.jFill');
            return;
        }
        return this;
    };
}(jQuery));
