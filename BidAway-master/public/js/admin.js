
$('#rm-item-btn').on('click', function (e) {
    const id = e.target.dataset.id;

    if (!id) {
        return;
    }

    $.ajax({
        method: 'DELETE',
        url: '/item/' + id
    })
    .done(function (data) {
        location.reload();
    });
});

$('.rm-cmt').on('click', function (e) {
    e.preventDefault();
    const id = e.target.dataset.id;

    if (!id) {
        return;
    }

    $.ajax({
        method: 'DELETE',
        url: '/comments/' + id
    })
    .done(function (data) {
        $('#cmt-' + id).remove();
    });
});
