


export const paginate = (page, size) => {
    if (page < 1 || !page) page = 1
    if (size < 1 || !size) {
        size = 5
    }
    let skip = (page - 1) * size;
    return { skip, limit: size, page };
}
