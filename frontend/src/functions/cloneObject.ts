export const cloneObject = (obj: object): object => {
    const clone = {};

    for (let key in obj) {
        if (typeof (obj as any)[key] === 'object') {
            (clone as any)[key] = cloneObject((obj as any)[key]);
        } else {
            (clone as any)[key] = (obj as any)[key];
        }
    }

    return clone;
};
