let $element = {};

$(function() {
    $element = {
        doc: $(document),
        body: $('body'),
        profile: $('.profile'),
    };

    // Everything that follows is dependent on the skeleton DOM existing.
    buildSkeletonDOM().then(() => {
        Object.assign($element, {
            sections: $('section'),
            logoHeader: $('.logo-header'),
            nameplate: $('.nameplate-container'),
            imageViewers: $('.image-viewer'),
            posts: $('.post'),
        });

        $('section:not(#posts)').hide();
        $element.imageViewers.hide();

        // Build DOM
        rehomeElements();
        nodeKiller();

        // Create Dynamic Content
        createLifeEventPostContents();
        createImgPostContents();
        populatePostsPhotoGallery();

        // Enable Navigation
        headerHandler();
        addNavEventListeners();
        enableImageViewer(); // image-viewer.js

        // Build Photos Tab
        updatePhotosNavTabWithProfileName();
        populatePhotosNavTabGallery('tagged');

        // populatePhotosNavTabGallery() includes a call to enableOpenImageViewer().
        // Since populatePhotosNav...() is called after populatePostsPhotoGallery(),
        // this call to enableOpenImageViewer() serves double-duty on page load and
        // also handles all the .photos created by populatePostsPhotoGallery().
        //
        // If for whatever reason populatePhotosNavTabGallery() is no longer called
        // on page load, we would need to call enableOpenImageViewer() here instead.

        // Build Prefs Tab
        try {
            prefPlacer($('#prefs > .feedbox')); // prefs.js
            addFakeSwitchToScribbleSliders();
            toggleFakeSwitchesBasedOnClass();
        } catch {
            console.log('Preferences could not be loaded.');
        }
    }).catch((error) => {
        console.error('buildSkeletonDOM() has failed!', error);
    });
});


///////////////
// BUILD DOM //
///////////////

function buildSkeletonDOM() {
    return new Promise((resolve, reject) => {
        // Logo Header
        const $logoHeader = $('<div class="logo-header width100 flex vertical-center"></div>');
        const $logoHeaderHtml = $logoHeader.html(`
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 1102 160">
                <defs>
                    <filter id="colorFilter" color-interpolation-filters="sRGB">
                        <feColorMatrix type="matrix" values="
                        0 0 0 0 0.031372549,
                        0 0 0 0 0.4,
                        0 0 0 0 1,
                        0 0 0 1 0" />
                    </filter>
                </defs>
                <image filter="url(#colorFilter)" xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAABE4AAAChCAYAAADZYfrIAAAY8ElEQVR4nO3d4XXbRroGYGSP/4u3AjEVmFuBmAqsW4GUCsytwEoFq1QQpYJVKlipgtAVXKqCpSrwPYwHG5iRbIkEMB9mnuccnPjk3o0BkgBm3vlm5rsGAAAAIKZ50zSXvhsAAACAv1o2TfMp5/E3XwoAAADA0wQnAAAAAM8QnAAAAAA8Q3ACAAAA8AzBCQAAAMAzBCcAAAAAz3jjgwGAYlymI7dV0zTrCX2o5+mco9kE+T4BoGqCEwAox7xpmrMAVzMLcA4vtTvXm6ZpTgKe202AcwCA6pmqAwDUbBU0NLkXnABADIITAKBW86BTdHauApwDAFSvEZwAABW7Clpt8mvTNHcBzgMAqtcITgCASu2qTS4CXvqjahMAiEVwAgDUKOr6IddpNx0AIAjBCQBQm2WQ3Yf2PaTgBAAIRHACANQmajixm6KzDXAeAECH4AQAqMll0zRvA16v7YcBICjBCQBQi1nghVctCAsAQQlOAIBarJqmOQ14rbYfBoDABCcAQA1mKTiJxvbDABCc4AQAqMEunDgJeJ22HwaA4AQnAEDp5k3TvA94jbYfBoAJEJwAAKWz/TAAcDDBCQBQsmXTNO8CXp/thwFgIgQnAEDJoi68GnGhWgDgCYITAKBUl03TnAW8tt32w+sA5wEAvIDgBAAoVcRqk0fVJgAwLYITAKBEu3DiNOB1XVsQFgCmRXACAJRmFrTa5CHwmisAwDMEJwBAaXbVJicBr8kUHQCYIMEJAFCSedM0HwJez2774dsA5wEAvJLgBAAoie2HAYBeCU4AgFIsm6a5CHgtth8GgAl748sDAAph+2EAKM82TXnNRnACAJRgV21yFvA6bD8MAMdZp/d8NqbqAAAluAl4DbYfBoACCE4AgKm7bJrmNOA1mKIDAAUQnAAAUzZL02Gisf0wABRCcAIATNmuquMk4PmrNgGAQghOAICpmgcNKGw/DAAFEZwAAFN1FbDaxPbDAFAYwQkAMEW7apOLgOdt+2EAKIzgBACYItsPAwCjEJwAAFOzbJrmLOA5m6IDAAUSnAAAU2P7YQBgNG8q/agXTdPMOv9s/7xvN396s/fv7tK/W090xfz9a2/SyN1z/7/da9x2rnv9xGfDZ/N0NHuf89c+65dad+bObzvfz9qc+iLsfi/n6XdyE3QqAuR22TTN24DfwmWAc+DrXtMG6tp22j1Tbf/lNt87mifaSF1nKYx8yqbTBl13vh/toPLpw+nDZfNd4de37Dyk2z+f9vjff0g34U36ZyTLdNPMO//s89rb679N119TI6J9YLUPq2Xn3+fe3eHj3kvBwzG+887R/f38ZK0EDrD7zXwI8MH9MNB7cZaea32/z471s2k6oSw6bZ/a2n8RLDuf+2LkoPO+0/a5E3JNlj6cPlw436UvY+hRkjEa//POD22ZYTSqXRAuxwjxvPOSGvsF1bpP119SA6L70FqmBnvEUc5veUzfy116SE45SBnjedXaDHg/L9N17IclXX10xJY9VDkdY8jP8CUuO9VfOdxleCaWHpxEub6ux/Q7m9pod4ntv0WGtW9ytv+i6FZLRlt7qKQ20D59uH7ow02jDzdmH+BZuy/q08DH+QDn3X54N+khOPQ1vPRYP1MyVsO1f0o3Xc6OyqHaz/Q6XUOkz7TvY5Ouc4rf0xjPq+7Rp3l6Mb30nu3jBXYV4HmQU+57OUfFUO7vvD2GCOxmKZyIcH3dY6qVJtp//R7rzEH12NoppRHvya8dU24D7XMP938P68PFNXYf4KljlJPoa7G08/Swi/ZDe+rouyG1SNe+nsC1bwd60PZpkb6j2wm+9Ps87iY2L3/sh2YfL9Bl+p299u8WnBxPcJLvGKIDeR3wGTrl0esptf+WE2oDlTzFcpbaTlNoh7/kmFobaJ8+3DCHPlxM1QQnnw5MsGbpy5tiov2ph5KvKV/7p6CjcBET3gjHZiKNh7Efmsd8JpdH/tb6mHMqOMl7/YKT/syDXNfQ1zmmyO2/pvL2XzTzibdHv3Vs0rPzuYVqo9KHi3sP68P1r6rg5DUNyPbHNsUf2v7x2htvMaFE9iVHtC0jp5D25jzuRihTPMbYD83X3r+z9Kzr60V5LMFJ3usXnPTnkKqt0n/fx4rc/iuhg15CeDILWuk11LGd2NQ7fbhY97A+3LCqCk6+Vc7a/thKTLO/9cObpdHpUjv1kSoZSnmYD31EbTiM/dB8adVH34FJexxLcJL3+gUn/YjQWHrqmPoaCVHaf/PCOhvdY8rhyariqcybiVST6cMNf+jDxVFVcPLpmTlTlxUsxvnctZde+tg9olQxROlUTOGI2ODL8dD8mqECk/Y4tmMmOMl7/YKTfkRsI0QbiTuE9t84x9QWD55X8r289D6PPH3HPZzv2vXhxlddcNIuMDR0ZyPise08fJcVvpQ2QV4+UUcuox7rYI2GHN/fUx3AsZ5hx3Y+BSd5r19wcrzLINfTPbYTXAvhKTnbf7WtNTaV6qTzyhfMf+oYY6eVQ+nDjXPow+nD/XH8beQLfpfSuf80TfOhaZqTkf/+nE46+8f/O+A+90M7DTLqUtL+/WN4W8A8/mPtdwDbkszanmGQQ8QdStpOAy/3rrM4+4fUJqjJFKbs7H7X//Je+4u2HRR9t8ih6cPpw1Vv7OBk56LiD/2swsZC14cAoy67h95j5nOYmrcF7hDwGu1I0yI1nn4Z8T6OvFAvDG0V8J35UMg0nRwuKu6UnwXveN+kNhpPO0mh0pS3Lu6DPly9IvThsssRnFC3CKOHfWzzWpuLitPmdtGz3zOMMpQwHQAOMQtabVJ7x4nDRQ3cbirvEL/GL54BVCziO3lUghPGdhGgMyg4OcxVpWnzboThfYDzgJqsAlYn3Ju6yBFOA+7UIjR5PeEJtYrQh8tKcEIOuV841jk5zEnlU3ZyMFWHGs2DThvQWeJYkSo3hSaHE55Qq6p/94ITcsjdcFBxcrizgCNmJTNVhxpFLAf+WehOD94Fea5fCk2Odm1wgwpVvUis4IQcTjO/bJRaH6f6OY7AYJYBO3SPnnv0KPeI7SJVTHCcdqcVAxzUJHcfLivBCbnkrlp4yPz3T5mqk/HUtuUd2H6Y0uV8f85SZ59+nJrCTIWq7QMITsgl97Z8Sq6PY24v0LdlwLDQ9sP07V3GT/Sq8i1Vh/DOYBKViby1+qAEJ+SSu3Fsus5xql9Ze0Q+Z2oRceRWSMwQcnS0F3aIG8yNdzUVqbYaWnBCTjkTehUnx6s2cR6ZxeeowWXAkXDbDzOUHO0flVPDOa190UyqU2WVleCEnHJ2CO2sczzBCdCHWdBOnWoThjJ2+yfiNLjSrFSdUJEqB/UEJ+QkOJk2c3rHoSFG6VZph4pIflKZyIDGbv/YFWp4J6pOqIjgBEY2z/yBf8z890/diWkko/AZU7J5wM7Go2kNDGzMaWkL1SajEZxQi9x9uCwEJ+SU+0VuNPF4qk6AY1wFrDZZ2X6YEYz1/tSZH8+JKX5UosowVnBCzUzXOZ5qiOFVmepThXnaoSuSj0F394FDzKxHNjrBCRRKcEJuOSsWcuyW8JB2arhPf546nfrh+YwpVcSAwug8Yxmj/XMesKKrdGfe21SiuqrzNwHOAXI5ZqrOffrnOpV0b/cqWA4NZWapiqP95yI9mKI2fMybBg4RcZeP32w/TGGmVG3Stqs2e+2ztk20O95mOrfXOrdOEpRHcEJuOVP5bwUn950XeBuQDN2o7v4dt51/v0jln5cBQ5SZ9QAGZToUJYrYqVBtwpjG2DHtXeBvtJ0Wd/fKqdPLFEycj7zI7msITqhBdZVVghNyy33T3afGSxuO3D0x2hHBOjXqr1JDI1JjaGGUdlDKrCnNZcCRY9sPM7ahQ/Go1Sa/prbMoffbXTpWKUS5Cli9dmZQiQoITqAyU5uft02NoV1D4UOA8wF4jVl6fkVi+2FKFK1985BC0z4HWu7Sda4C7tC13KscBiau9MVh24U4PwY4lxw+FrQIKV+6SvPxI7Al8TAe08jc30u8OKq1Clheb/vhMt2n52itIk3z/Dhwdep1aotE+r5Nsz2OPpw+XDglVZzcd+ZJrp8pAVyk0fpVYeXvj51rv+usx7FvmdL+aNs/cpjL9Ds3laMsDykYu9WZozCzgOuI2H54+j7utf+eWi8j8jphQ4kyfeVjan8O/T5bp7/nLsh3bFDp5fTh9OEmY/dFfJrgsU2NnfMDFtiapR/mFK+7PTadhP21Funzi3Ad0Uq2p+amsu9wqs+rlxw3AzS0rjJfU+61b+4qujdaub/z9njqt3wd8L6ruXMz9fbf5QHtv3mg9t+Qz8dFoO9q7HUQzgNd+9D04aZ56MMdJvvvfWoVJ49pFPb2yHmD2/ThrwOvyP2Uh3TdN69cgXxfm8r/PspZM6TbAOmzUZXDPab7+drClBRu13l6H+wSbT88Lb/20P7bpHdW6dWaUaaJ5Hi33aYKhtwVNycWiP2CPpw+3ORNZY2TXZnfj6nhddnTYkvbCVU77BoL/5uuf3XkDddap/8u06bRP027F+g/Ove00ITSRdzqV8VjfG377396bv+VvvV0hN0uHjPeY1G+X+uc6MPpwxUkenDSLoy4SAld36lt5NWuH9P2iN/3+KDZZ7Xv6dtWvvjd1Dx0GhDXRqKoSMR1RErvPE9Zze2/PkQITnLe8+sgi4pWt11rhz6cPlxxIgYn7Y+tHV3oI5l7zjaV80XSdqxmR+5z/xJuujIMeY/Qj91z5ofUiLIQJTWKOEJ2YaphKPudjdraf32qPTiJ8Pc3FQYn+nD6cEWLtMbJYxqBrXUUtt1JQ6cKynGf7mtTquBzhcd5sLUlrpXTZ1d7+28Ir11ws2+PAQZ1Irx3c38PY6n9HtaHq0SUipOfUip7leGGy/1gfeyU7ue44UoecYFc2gqTpdAE/mubGtaRvDVlJ6ua239Depv5749QCRvhHGoIZfXh9OGqESU4yXGzRbGWUHIkC4vG8SAwga+6SvdJJFcVjQxHU3P7r2RR3n86lsPTh6MaU9lVB3ie4CS/7qiDwAS+LlqFx4kddgCArxGcABznJ4u+wqvcBhwJfm+tE+iNKiKgOIITgMPcp90flJrD60VcVyTa+iswVVF2+1MBCvRGcALwOrtpOf9I65iYJgWHibg98VnaQhMA4AuCE4DXWRiZhl6sUhAZybWFYgGAfYITgNdRZQL9iLg98YntiQGAfYITACCXiNsTf0gLPgMA/EFwAgDkFLHCwy5ZAMB/CU4AgJwibk+8Wyj2PMB5AAABvPElwMHm6VikxQRn6c9jU1IOTN2u6uT3YNdwnUIdAKByghN4uWXnWKRFBAE4Xrs98UWgz/I0rcFyFeBcAICMBCfwdeedQ1ACMJxVE+9Zu0rrndhNCwAqZo0TeNplaij/K42ACk0AhhV1e+Jo5wQAjExwAl86T4HJL6lMG4DxRNye+F2apgkAVEpwAp/tFna9SxUmAhOAfGxPDACEIjiBzwu9btL2kwDkFXF74tOggQ4AMALBCbVbpkoTa5gAxBExpLhK1YkAQGUEJ9RskUY2hSYAsbTbE0dioVgAqJTghFrNVZoAhLar8HgMdoIXFooFgPoITqiVShOA2DZBKzxUnQBAZQQn1Gg3ivnWNw8Q3nXA7Yl374/LAOcBAIxEcEJt5nZGAJiMbQq7o7m2UCwA1ENwQm2uTNEBmJSbgNsTnwQNdACAAQhOqMksLewHwLREDCnep93ZAIDCCU6oiTnpANN0F3B74sZCsQBQB8EJNRGcAExXxO2Jz7xbAKB8ghNqMbeTDsCkRd2e+MpCsQBQNsEJtTj3TQNMXsTtiU/t1gYAZROcUIulbxpg8qJuT/whVTYCAAUSnFALwQlAGSJuT9yk8wIACiQ4oQa7UcAT3zRAMSJWnZyZFgp/iLLmj7WHgN688VFSgejl08eOnM7THHuAWrTbE18Eu97dGiy3Ac4DcloEuQ8WAc4BKITghBpEeXE+plLuXWNinebq9+Eqza8HqMlVqvCIVFF4ms4rYkUMAHAgU3WoQYRSzV9TZcgqjZT2FZoAz1OmXbao2xOvLBRL5aL8/t2HQG8EJ9Qg94vzt6ZpLoUlVCjXvXeZOtVv/eiKF3F74pOggQ71eMx8pREqfWcBpjFr90FBBCfUIHdwclnHxwx/MXajtQ1MfrHuTzWibk/8zm5uZLTO/OG/DVDxF+H+y/09AD0SnMCwfjPiQOWGDi5nqeMsMKmX7Ykhntw7TNnhCuiV4ASGZbSB2g3VeF2kjukmLY4sMKlbxKqT07TeCYwtQtsjZ7XtLEhwchfgHICeCE4AGNKqx5LtWfrv7ToFv6etaCPtqEI+7fbE0VxZpJgMNgE+9LOMa51cBnk3qDiGgghOYFhGG6jd6ZELZc5SI3i3jfd/mqb5p0VfecZVgEUx91kolhyiVLvm+O3PAlWgqTqGgghOYFgRVpaH3C5SiPjS9U6WqeG7TmHJL2mxTfiaqNsTX1golpFF6bCfZZiudhOk2uRjgHMAevTGhwmDUqINn+0a0P+XGpO36d+tO+HiPP1ZNQnHuE4VStHWvLkWpDOibdqmO8J98M90PmMslnwTKGRXbQKFEZzAsHJvhQzRvBWOMKB2e+Jfgn3Ib1OgY6cdxrIOFCD+kgaShqoIa//bFwP99w8hOIHCmKoDw1KeDTCuqNsTX6tCZETR1lj75yunbL7UMoUUkUKTxhp3UB7BCQzrdMAt+dodRnJu+QcQUcTtiU+Cnhdlug14Ve2UzZsjtwtuFw3fhRP/Djg170HFCZTHVB1qsEkv61yuUgOmr23plqnBcG4rVr5h16j84EOiQrvf/m8BFxV+nzqNOlUMbRNonZN9F+l4TPfqulOhsdnbTnmRgpJZ+vMyc5vuJVSbQIEEJ9Rgk/kaT9NLdHXEy/Q8NRbOgzaCAKJZBd2N6do0TkZym8K6qE7SPfqusJA/YrUPcCTBCTXIHZw0aWHAf6d597dpdGW9V4Uy78z9XdplhB5E+O1DLrvf/08BO2RnFoplJDfBg5MSPQpOoEyCE2oQqfN4NoESU8ohOKF216nyJNq0xr6ncMJT1mkLeAMw4xGIQqEsDksNzCWnZg++fSq2TcFJNKdBz4vyDLUFME/zeUOhBCfUYKvzSMVUnVC7mzTqHs2HAbZmhX23afoIw7v3zoVyCU6ohaoTamV1f4hb3aGsn6FtVUGMxnbjUDDBCbXQeaRWQkP4c3viaM7SbmkwpGtVJ4O719aEsglOqIWXGbUSnMBnUatOVAMwNFUnw7NmERROcEIt1tY5oVIbv334Q7s9cTSnSvwZwZV3wWB+NkgB5ROcUBP76lMrFVfwWdQpCysLxTKCSx9y7x4Fn1AHwQk1UaZKrYSG8FnU7YlPvKMYwV2qjqA/l+m5AhROcEJNNmnxLqjNnYUB4b+ibk/8rmmaZYDzoGyroL//KfrZwATUQ3BCbWz9SI22GnfwBQvFUrOlMP1o9xaEhboITqjNjcXRqJTQEP4UdXvitzpjjGArPDnKR9uIQ30EJ9RIo5Qa3SnPhi9EfRfsFpqcBTgPyrYWnhzkY/rcrGsClRGcUKNba51QKdMA4E9Rtye2UCxjEZ68jtAEKiY4oVaXGgpU6EZoCF+Iuj3xhYViGYnw5GWEJlA5wQm12piyQ6WuKr3uX5um+T79E1pRtyduKr5XGd8uPJmbzvms3XtjITSBuglOqNlNgZ2on4wa8Q13aQvFGjyme+L7VGW2sUguT4i6PfFZ+t3CGLYpHKjl/fASu3fIj+5DoBGcwB8vwxLCk3Y0/cq2s7zAqvCRxfvU2J2le2LT+b/d2VmLJ0TenthCsYxpdy/84Dn5x3tkIWwHWoITmHZ48uveaHojOOGFloWFJw+d6pLlNxq7Ft5kX9TtiU9M2SGDuxQa1FjF+pCC9+Ve6A5UTnACn00pPGmnH/zPXmDSujVdhxfYFhCePKSy8r+n+fn71SXPMYLIU6JWnbxPnVgY0zY9UxeVrA3Vtq1UmQBPEpzAny7TKEPU0GF/+sHXFilTdcJLTDE8+bgXlqzSwoavsbVILE+Iuj1xo0qKjDapffR9oRUobYXJ/AVtK6BighP40k0abYhSst2OqL9k+kGX4ISXir4g4GO6H39M98HiwLBknxFFnhJ1e+LdQrHnAc6Dem1SsDBLz+Opb23/a1rLZZ7eBwIT4KsEJ/BXm9RA/SFTw2B/+sHqgHm2puvwWqv0m8vdGG6Dkn+k85ml+/Gm5/nmFonlKZG3J7ZQLFHcpMGc79OzOuL6QPseU1jyY2eq812sUwSAaZunBuuu0/ZpgGObgo5V+rsgt7a6aYjfe/fYpobrVQpH/P4BpmuZnud36fk+9Dvka8em07ayRhBwtO98hPAqi9QwWKY/n77yf/+QXuZ3aarB2qrtBDbr/N53x9sDTvWxM62mbUy3v32l0QDlmqe20iL9uT1e23b6mo+d98q2077yfgF6JTiB4y32yqcX6YXdDUQ2AhIKMX9hZYiGKwBfs99+eiltKmBcTdP8P08qkZnaRo7zAAAAAElFTkSuQmCC"/>
            </svg>
        `);
        $element.profile.append($logoHeaderHtml);

        // Top Half
        const $topHalf = $('<div class="top-half flex column vertical-center"></div>');
        const $topHalfHtml = $topHalf.html(`
            <div class="nameplate-container width100">
                <!-- .nameplate is moved here on load. -->
            </div>
            <div class="navbar flex">
                <a class="selected nav-item js-nav-item js-section-nav" id="section-nav--posts">Posts</a>
                <a class="nav-item js-nav-item js-section-nav" id="section-nav--photos">Photos</a>
                <a class="nav-item js-nav-item js-section-nav" id="section-nav--prefs">Preferences</a>
            </div>
        `);
        $element.profile.append($topHalfHtml);

        // Bottom Half
        const $bottomHalf = $('<div class="bottom-half flex horizontal-center"></div>');
        const $bottomHalfHtml = $bottomHalf.html(`
            <section id="posts" class="flex">
                <div class="left-column">
                    <!-- .about.feedbox is moved here on load. -->
                    <div class="posts__photos feedbox">
                        <div class="posts__photos__header flex space-between vertical-center">
                            <h2 class="feedbox__header">Photos</h2>
                            <a class="js-nav-item js-section-nav" id="section-nav2--photos">See all photos</a>
                        </div>
                        <div class="photo-lineup">
                            <!-- Built programmatically based on .image-viewer elements. -->
                        </div>
                    </div>
                    <div class="copyright center-text">Built by <a href="./ClaimToBeAPlayer">ClaimToBeAPlayer</a></div>
                </div>
                <div class="right-column">
                    <!-- Built programmatically from .post elements above. -->
                </div>
            </section>
            <section id="photos">
                <div class="feedbox">
                    <h2 class="feedbox__header">Photos</h2>
                    <div class="navbar flex">
                        <a class="selected nav-item js-nav-item js-photos-nav" id="photos-nav--tagged">Tagged photos</a>
                        <a class="nav-item js-nav-item js-photos-nav" id="photos-nav--photos">Photos</a>
                        <a class="nav-item js-nav-item js-photos-nav" id="photos-nav--albums">Albums</a>
                    </div>
                    <!-- Built programmatically per .selected.nav-photos based on .image-viewer elements. -->
                </div>
            </section>
            <section id="prefs">
                <div class="feedbox">
                    <h2 class="feedbox__header">Preferences</h2>
                    <!-- Built programmatically from #pref-sliders. -->
                </div>
            </section>
        `);
        $element.profile.append($bottomHalfHtml);

        resolve();
    });
}

// Because these elements have been plucked from their proper place in the DOM
// for ease of editing, they need to be re-inserted now that we're compiling.

function rehomeElements() {
    rehomeCoverPhoto();
    rehomeNameplate();
    rehomeBio();
    rehomePosts();

    function rehomeCoverPhoto() {
        $('.top-half').prepend($('.profile > .cover-img'));
    }

    function rehomeNameplate() {
        $('.top-half .nameplate-container').append($('.profile > .nameplate'));
    }

    function rehomeBio() {
        $('#posts > .left-column').prepend($('.profile > .about'));
    }

    function rehomePosts() {
        $('.profile > .post').each(function() {
            $('#posts > .right-column').append($(this));
        });
    }
}

// Kill the terrible, horrible, no good very bad &nbsp that pops up for no reason.
function nodeKiller(){
    var body = document.getElementsByTagName('body')[0];
    body.removeChild(body.childNodes[4]);
}

////////////////////////////
// CREATE DYNAMIC CONTENT //
////////////////////////////

// POSTS //

function createLifeEventPostContents() {
    const lifeEventMap = {
        'relationship': {
            caption: 'In a Relationship',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/relationship.png)'
        },
        'family': {
            caption: 'Welcomed Someone to the Family',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/family.png)'
        },
        'health': {
            caption: 'Had a Big Health Event',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/health.png)'
        },
        'interest': {
            caption: 'Started a New Hobby',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/interest.png)'
        },
        'milestone': {
            caption: 'Achieved Something Special',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/milestone.png)'
        },
        'move': {
            caption: 'Moved to a New Town',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/move.png)'
        },
        'remembrance': {
            caption: 'Passed Away',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/remembrance.png)'
        },
        'school': {
            caption: 'Started at a New School',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/school.png)'
        },
        'travel': {
            caption: 'Went on a Trip',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/travel.png)'
        },
        'work': {
            caption: 'Started a New Job',
            bgImage: 'url(//claimtobeaplayer.github.io/marunomia/fauxbook/img/life-events/work.png)'
        }
    };

    $('.life-event').each(function() {
        const $lifeEvent = $(this);

        const $bgElement = $('<div>', { class: 'life-event__bg circle-img' });
        const $captionElement = $('<div>', { class: 'life-event__caption' });
        const $datelineElement = $('<div>', { class: 'life-event__dateline' });

        // Decide on the correct caption and bg-image based on life-event class.
        let bgImageUrl = '';
        let defaultCaptionText = '';

        for (const key in lifeEventMap) {
            if ($lifeEvent.hasClass(key)) {
                bgImageUrl = lifeEventMap[key].bgImage;
                defaultCaptionText = lifeEventMap[key].caption;
                break;
            }
        }

        // Apply the bg-image.
        $bgElement.css('background-image', bgImageUrl);

        // Apply the caption (if a custom one is not defined in the DOM).
        const $customCaption = $lifeEvent.children('.life-event__caption');
        const hasCustomCaption = $customCaption.length
        if (!hasCustomCaption) {
            $captionElement.text(defaultCaptionText);
        }

        // Set the life-event dateline to the parent .post's post-date.
        // (On FB life events can show any date, but we won't allow that...yet.)
        const $parentPostElement = $lifeEvent.closest('.post');
        const $postDateElement = $parentPostElement.find('.post-date');
        $datelineElement.text($postDateElement.text());

        // Now place all the elements we've created above into the real DOM.
        $lifeEvent.prepend($bgElement);
        if (!hasCustomCaption) {
            $lifeEvent.append($captionElement);
        }
        $lifeEvent.append($datelineElement);
    });
}

function createImgPostContents() {
    const $imgPosts = $('.right-column .post[data-img-viewer-ref]');

    $imgPosts.each(function() {
        const $placeholderPost = $(this);
        const matchingImageViewerID = $placeholderPost.attr('data-img-viewer-ref');

        const $imageViewer = $('#' + matchingImageViewerID);
        const $imageViewerImg = $imageViewer.find('.image-container img');
        const $imageViewerPost = $imageViewer.find('.post');

        // Replace placeholder HTML with "real" HTML from the image-viewer post.
        // This gets us our text, comments, etc.
        $placeholderPost.html($imageViewerPost.html());

        // Create the HTML for the big photo that will be added to the post.
        const imgSrc = $imageViewerImg.attr('src');
        const photoHtml = `
            <div id="img-link_${matchingImageViewerID}" class="photo width100">
                <img src="${imgSrc}">
            </div>
        `;

        // Insert that ^ into the post, after text (if present) or else byline.
        const $text = $placeholderPost.children('.text');
        const $byline = $placeholderPost.children('.byline');
        if ($text.length) {
            $text.after(photoHtml);
        } else if ($byline.length) {
            $byline.after(photoHtml);
        }

        // If >1 comments, show only the top comment and add a "view more" btn.
        const $comments = $placeholderPost.find('.comment');
        if ($comments.length > 1) {

            // Find the top comment
            // const $comments = $placeholderPost.find('.comment');
            let $topComment = null;
            let maxReactions = -1;

            $comments.each(function() {
                const $comment = $(this);
                const reactionCount = parseInt($comment.find('.reaction-icons .reaction-count').text(), 10);
                if (reactionCount > maxReactions) {
                    maxReactions = reactionCount;
                    $topComment = $comment;
                }
            });

            // Remove all but the top comment
            $comments.not($topComment).remove();

            // Create the "View more comments" element
            const viewMoreCommentsHtml = `
                <div id="img-link_${matchingImageViewerID}" class="view-more">
                    View more comments
                </div>
            `;

            // Prepend the "View more comments" element to the .comment-section
            $placeholderPost.find('.comments-section').prepend(viewMoreCommentsHtml);
        }

        // If there are no likes/comments, set margin-bottom on the photo to 0.
        const $photo = $placeholderPost.find('.photo');
        if (!$placeholderPost.children('.engagement').length
        && !$placeholderPost.children('.comment').length) {
            $photo.css('margin-bottom', '0');
        }
    });
}

// POSTS__PHOTOS //

// Add the image from the first 9 image-viewers to #posts .photo-lineup.
function populatePostsPhotoGallery() {
    const $photoLineup = $('#posts .photo-lineup');
    const imageViewers = $element.imageViewers;

    imageViewers.slice(0, 9).each(function() {
        addImgToPhotosLineup($(this), $photoLineup);
    });
}

// Helper function that adds an img from an image-viewer to a .photo-lineup.
function addImgToPhotosLineup($imageViewerElement, $photoLineup) {
    const imageViewerID = $imageViewerElement.attr('id');
    const imageViewerImgSrc = $(`#${imageViewerID} .image-container img`).attr('src');

    // Create the .photo element that will be added to the .photo-lineup.
    const photoHtml = `
        <a id="img-link_${imageViewerID}" class="photo">
            <img src="${imageViewerImgSrc}">
        </a>
    `;

    $photoLineup.append(photoHtml);
}


////////////////
// NAVIGATION //
////////////////

function headerHandler() {
    // FIXME: This is not ideal because it runs on every scroll event, which
    // could lead to performance issues. But the code is simple, so it's ok.
    window.addEventListener('scroll', function() {
        if (window.scrollY > 434) {
            $element.body.addClass('squished');
            enableSquishedNameplateClickToScrollToTop();
        } else {
            $element.body.removeClass('squished');
            $('.nameplate').off('click');
        }
    });
}

function enableSquishedNameplateClickToScrollToTop() {
    $('body').off('click', '.nameplate');
    $('body').on('click', '.nameplate', function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    });
}

function addNavEventListeners() {
    handleNavItems();
    handlePhotoNavItems();

    function handleNavItems() {
        $('.js-section-nav').click(switchSection);
    }

    function handlePhotoNavItems() {
        $('.js-photos-nav').click(function() {
            generateSelectedPhotoNavTab($(this));
            selectNavItem($(this));
        });
    }
}

function switchSection() {
    // All .nav-items will have an id like "section-nav--posts", so we can
    const sectionToShow = $(this).attr('id').split('--').pop();
    $element.sections.hide().filter("#" + sectionToShow).show();

    // Get the navtab in the main navbar (under .top-half) that corresponds to
    // the sectionToShow and select it. This is slightly inefficient as in most
    // cases -- when that tab is clicked directly -- we could just hijack the
    // click event and use $(this). But we need to handle cases where a section
    // is opened from outside the main navbar, e.g. w/ the "See all photos" btn.
    const $navItemToSelect = $(`.top-half .nav-item[id*="${sectionToShow}"]`);
    selectNavItem($navItemToSelect);

    window.scrollTo(0, 0);

    if (sectionToShow === "photos") {
        // Close the album view if it's open.
        $(".album-contents").remove();

        // Bring us back to the "Tagged" photo lineup.
        selectNavItem($("#photos-nav--tagged"));
        generateSelectedPhotoNavTab($("#photos-nav--tagged"));

        // This contains photo/album lineups and is hidden if viewing an album.
        // We'll explicitely bring it back here so if we were viewing an album
        // clicking the Photos tab will bring us back to the main photo lineup.
        $('#photos .feedbox').first().show();
    }
}

function selectNavItem($selectedNavItem) {
    $selectedNavItem.siblings('.js-nav-item').removeClass('selected');
    $selectedNavItem.addClass('selected');
}


//////////////////////
// BUILD PHOTOS TAB //
//////////////////////

// Renames the tab for "self-posted photos" to "X's Photos" instead of "Photos".
function updatePhotosNavTabWithProfileName() {
    const mainGirlName = $('.profile-name').text();
    $('#photos-nav--photos').text(mainGirlName + "'s Photos");
}

function generateSelectedPhotoNavTab(selectedTab) {
    const $photosFeedbox = $('#photos .feedbox');
    const photoNavTabToDisplay = selectedTab.attr('id').split('--').pop();

    $photosFeedbox.find('div:not(.navbar)').remove();

    if (photoNavTabToDisplay !== 'albums') {
        // "Tagged" or "X's Photos" appear directly in a standard photo-lineup.
        $photosFeedbox.append(`<div class="photo-lineup width100 flex"></div>`);
        populatePhotosNavTabGallery(photoNavTabToDisplay);
    } else {
        // The Albums tab has to display the albums for users to click to open.
        $photosFeedbox.append(`<div class="album-lineup width100 flex"></div>`);
        populateAlbumLineup();
    }
}

function populatePhotosNavTabGallery(photoNavTabToDisplay) {
    const $photoLineup = $('#photos .photo-lineup');
    const mainGirlName = $('.profile-name').text();

    $photoLineup.empty();

    $element.imageViewers.each(function() {
        const imgAlbum = $(this).data('album');
        const imgPostedBy = $(this).find('.byline .bold').text();

        if (imgAlbum === photoNavTabToDisplay // Album matches tab, e.g. "tagged"
        || (photoNavTabToDisplay === "photos" // Viewing main girl's posted imgs
            && imgPostedBy === mainGirlName)
        || (photoNavTabToDisplay === "tagged" // Any img not posted by main girl
            && imgPostedBy !== mainGirlName)) {
            addImgToPhotosLineup($(this), $photoLineup);
        }
    });

    // Need to run enableOpenImageViewer because we added new .photo elements.
    enableOpenImageViewer(); // image-viewer.js
}

function populateAlbumLineup() {
    // This Map will store album data before we add it to the DOM.
    const albumsList = new Map();

    // Add each album to the Map, and increase their item counts per img added.
    $element.imageViewers.each(function() {
        // The album name will be defined in the HTML "data-album" attribute.
        const albumName = $(this).data('album');

        // img-viewers with albumName 'tagged' are not albums, so skip them.
        // (They appear instead as individual photos under the "Tagged" tab.)
        if (albumName === 'tagged') return;


        if (!albumsList.has(albumName)) { // Album is not in the Map, so add it!

            // Replace any shorthand data-album values, e.g. "propic".
            if (albumName === 'propic') { albumName = 'Profile pictures'; }

            albumsList.set(albumName, {
                // Will ultimately reflect the # of pics in the album.
                count: 1,

                // We set the album thumbnail to the image-viewer element's img.
                // Because it's the "latest" of this album, it is the thumbnail.
                albumThumbnailImg: $(this).find('img').attr('src')
            });
        } else { // Album is already in the Map, so increase its img count!
            albumsList.get(albumName).count += 1;
        }
    });

    // Clear the album container so we have a clean slate to add our new albums.
    const albumsContainer = $('.album-lineup');
    albumsContainer.empty();

    // Create elements for each album in albumsList and add to .album-lineup.
    albumsList.forEach((album, name) => {
        const albumElement = $('<div>', { class: 'album' });

        const albumLink = $('<a>', {
            id: `album-link--${name.replace(/\s+/g, '_')}`,
            class: 'photo',
            html: `<img src="${album.albumThumbnailImg}">`
        });

        const albumTitle = $('<div>', {
            class: 'album__title bold',
            text: name
        });

        const albumCount = $('<div>', {
            class: 'album__item-count',
            text: `${album.count} Item${album.count > 1 ? 's' : ''}`
        });

        albumElement.append(albumLink, albumTitle, albumCount);
        albumsContainer.append(albumElement);
    });

    enableOpenAlbumView();
}

// ALBUM VIEWER //

function enableOpenAlbumView() {
    $('.album-lineup').on('click', '.album', function() {
        openAlbumView($(this));
    });
}

function openAlbumView(albumToOpen) {
    // Hide the element containing the #photos navbar, photo/album-lineups, etc.
    // The album viewer is a separate view, so we don't want that stuff visible.
    $('#photos .feedbox').first().hide();

    // Now we build the album viewer in its place!
    $('#photos').append(`
        <div class="album-contents width100 flex column">
            <div class="album-contents__header feedbox">
                <h1 class="album-contents__header__title bold"></h1>
                <div class="bold count"></div>
            </div>
            <div class="album-contents__pictures feedbox">
                <div class="photo-lineup"></div>
            </div>
        </div>
    `);

    const albumTitle = albumToOpen.find('.album__title').text();

    // Now that we have the album viewer "tab" built, with its own photo-lineup,
    // we can populate it just like we would any other photo tab, e.g. "tagged".
    populatePhotosNavTabGallery(albumTitle);

    // Set up the album viewer header.
    displayAlbumTitle();
    displayAlbumItemAndContributorCount();

    function displayAlbumTitle() {
        $('.album-contents__header__title').text(albumTitle);
    }

    function displayAlbumItemAndContributorCount() {
        // This is just the number of images in the album.
        const numberOfItems = $('.album-contents__pictures .photo').length;
        const numberOfItemsText = numberOfItems === 1 ? 'Item' : 'Items';

        // Get # of contributors, i.e. ppl whose posts/imgs are in the album.
        const albumUniqueContributors = new Set();
        $element.imageViewers.each(function() {
            if ($(this).data('album') === albumTitle) {
                // We add every byline name; JS will only keep the unique ones.
                albumUniqueContributors.add($(this).find('.byline .bold').text());
            }
        });
        const numberOfContributors = albumUniqueContributors.size;
        const contributorText = numberOfContributors === 1 ? 'Contributor' : 'Contributors';

        $('.album-contents__header .count').text(`
            ${numberOfItems} ${numberOfItemsText} ·
            ${numberOfContributors} ${contributorText}
        `);
    }
}


/////////////////////////////
// CUSTOM SCRIBBLE SLIDERS //
/////////////////////////////

function addFakeSwitchToScribbleSliders() {
    $('.scribble-slider').each(function() {
        $(this).append(`
            <label class="switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        `);
    });
}

function toggleFakeSwitchesBasedOnClass() {
    $('.scribble-slider').each(function() {
        const $scribbleSlider = $(this);
        const $checkbox = $scribbleSlider.find('input[type="checkbox"]');

        if ($scribbleSlider.is('.plus50, .plus100')) {
            $checkbox.prop('checked', true);
        } else if ($scribbleSlider.is('.minus50, .minus100')) {
            $checkbox.prop('checked', false);
        } else {
            // Because this profile uses binary like/dislike indicators,
            // we'll just delete the pref entirely it's a zero value (no pref).
            $scribbleSlider.closest('tr').remove();
        }

        // Disable the checkboxes so they can't be checked/unchecked.
        $checkbox.prop('disabled', true);
    });
}
