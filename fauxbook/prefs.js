let prefsToShow = 'prey';

function prefPlacer($customPrefsContainer){
    $('#sliders-clearfix, #pref-sliders').hide();
    tableSetter($customPrefsContainer);
}

function tableSetter($customPrefsContainer, pairsPerRow = 1) {
    const prefValues = convertPrefsToObj();
    const prefTitles = Object.keys(prefValues);
    const numberOfPrefs = prefTitles.length;

    const $pref_table = $('<table id="pref-table"></table>');
    const prefTableRows = [];

    // Adds new rows to the pref table, with a specified number of preference title/slider pairs per row.
    for (let i = 0; i < numberOfPrefs; i += pairsPerRow) {
        const row = $('<tr></tr>');

        for (let j = 0; j < pairsPerRow; j++) {
            const index = i + j;
            if (index < numberOfPrefs) {
                const title = prefTitles[index];
                const value = prefValues[title];

                const tdTitle = $(`<td id="pref${index}-title" class="pref-title"></td>`).text(title);
                const tdSlider = $(`<td id="pref${index}-slider" class="scribble-slider"></td>`);
                addSliderClass(tdSlider, value);

                row.append(tdTitle, tdSlider);
            } else {
                // If there are no more preferences, add empty cells to complete the row.
                row.append('<td class="pref-title"></td>', '<td class="scribble-slider"></td>');
            }
        }

        prefTableRows.push(row);
    }

    $pref_table.append(prefTableRows);
    $($customPrefsContainer).append($pref_table);
}

function convertPrefsToObj() {
    const obj = {};

    // Go through Eka's #pref-slider-table and pull title and value data from each <tr>.
    $('#pref-slider-table tr').each(function() {
        const prefTitleElement = $(this).find('.preftitle').first();
        // The "Being Pred"/"Being Prey" prefs are in child divs, other prefs are in titleElement.
        const beingRole = $(prefTitleElement).find(`.pref${prefsToShow}`);
        const prefTitle = beingRole.text().trim() || prefTitleElement.text().trim();
        const sliderVal = $(this).find(`.prefbox.pref${prefsToShow} .colorbar`).data('value');
        obj[prefTitle] = sliderVal;
    });

    return obj;
}

function addSliderClass(element, value) {
    if (value >= -100 && value <= -90) {
        element.addClass('minus100');
    } else if (value > -90 && value <= -10) {
        element.addClass('minus50');
    } else if (value > -10 && value <= 10) {
        element.addClass('zero');
    } else if (value > 10 && value <= 90) {
        element.addClass('plus50');
    } else if (value > 90 && value <= 100) {
        element.addClass('plus100');
    }
}