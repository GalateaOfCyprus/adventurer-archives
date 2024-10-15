function enableImageViewer() {
    enableOpenImageViewer();
    enableExitImageViewer();
    enableImageViewerNextLast();
    enableImageViewerFullscreenToggle();
}

function enableOpenImageViewer() {
    $('.photo, .view-more').click(function() {
        // .photo elements have an ID like "#img-link_{idOfLinkedImgViewer}"
        const idOfImageViewerToOpen = $(this).attr('id').substr(9);

        $element.imageViewers.each(function() {
            if ($(this).attr('id') === idOfImageViewerToOpen) {
                openImageViewer($(this));
                return;
            }
        });
    });
}

function openImageViewer(imageViewerToOpen) {
    // We hide all the imageViewers first because if this fn is called for a
    // .next/.last click, then an imageViewer would still be open.
    $element.imageViewers.hide();

    // Hide the logo and nameplate; these have high z-indexes and would overlap.
    $element.logoHeader.hide();
    $element.nameplate.hide();

    imageViewerToOpen.show();

    // Prevents scrolling of the page body in the background.
    $element.body.css('overflow', 'hidden');

    // Enables scrolling for cases w/ lots of content in an imageViewer post.
    $element.posts.css('overflow-y', 'auto');
}

function enableExitImageViewer() {
    $('.exit').click(function() {
        $element.imageViewers.hide();

        $element.logoHeader.show();
        $element.nameplate.show();

        $element.body.css('overflow-y', 'scroll');
        $element.posts.css('overflow-y', 'visible');
    });
}

function enableImageViewerNextLast() {
    // Show the .next/.last btns if there are other image-viewers in the album.
    // If not, then hide them.
    $element.imageViewers.each(function() {
        const imageViewersInAlbum = getOtherImageViewersInAlbum($(this));
        if (imageViewersInAlbum.length <= 1) {
            $(this).find('.next, .last').hide();
        } else {
            $(this).find('.next, .last').show();
        }
    });

    // Enable the .next/.last btn functionality.
    $('.next, .last').click(function() {
        const direction = $(this).hasClass('next') ? 'next' : 'prev';
        const currentImageViewer = $(this).closest($element.imageViewers);
        const imageViewerToOpen = getNeighboringImageViewer(currentImageViewer,
                                                            direction);
        openImageViewer(imageViewerToOpen);
    });

    function getOtherImageViewersInAlbum(imageViewer) {
        const currentImageViewerAlbum = imageViewer.data('album');
        const imageViewersInAlbum = $('.image-viewer[data-album="'
                                    + currentImageViewerAlbum + '"]');
        return imageViewersInAlbum;
    }

    function getNeighboringImageViewer(currentImageViewer, direction) {
        const imageViewersInAlbum = getOtherImageViewersInAlbum(currentImageViewer);
        const currentImageViewerIndex = imageViewersInAlbum.index(currentImageViewer);

        if (direction === 'next') {
            return imageViewersInAlbum.eq(
                (currentImageViewerIndex + 1)
                % imageViewersInAlbum.length);
        } else if (direction === 'prev') {
            return imageViewersInAlbum.eq(
                (currentImageViewerIndex - 1 + imageViewersInAlbum.length)
                % imageViewersInAlbum.length);
        }
    }
}

function enableImageViewerFullscreenToggle() {
    $('.full, .smol').click(function() {
        const currentImageViewer = $(this).closest($element.imageViewers);
        const btnIsFullscreenToggle = $(this).hasClass('full');

        if (btnIsFullscreenToggle) {
            // Make the image fullscreen.
            currentImageViewer.find('.post').hide();
            $(this).removeClass('full').addClass('smol');
        } else {
            // Return to normal image-viewer view.
            currentImageViewer.find('.post').show();
            $(this).removeClass('smol').addClass('full');
        }
    });
}