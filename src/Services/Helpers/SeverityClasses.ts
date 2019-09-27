
function getSeverityClass(severity) {
    switch (severity) {
        case "Low": return "bg-info";
        case "Medium": return "bg-warning";
        case "High": return "bg-danger";
    }
}

export default {
    getSeverityClass,
};
