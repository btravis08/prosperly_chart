class KPIGaugeChart {
  constructor(el, data = null) {
    this.el = el;
    this.data = data;
    this._init();
  }

  _init() {
    this._setup();
    this._scaffold();
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          this.isInView = true;
          setTimeout(() => {
            this._render();
          }, 500);
          this.io.unobserve(this.el);
        }
      });
    });
    this.io.observe(this.el);
  }

  _setup() {
    this.width = 48;
    this.height = 48;
    this.gaugeStrokeWidth = 3;
    this.gaugeRadius =
      Math.min(this.width, this.height) / 2 - this.gaugeStrokeWidth / 2;
    this.gaugeSpanAngle = (Math.PI / 2) * 3;
    this.gaugeGapAngle = Math.PI * 2 - this.gaugeSpanAngle;
    this.gaugeStartAngle = (-Math.PI / 2) * 3 + this.gaugeGapAngle / 2;
    this.gaugeEndAngle = Math.PI / 2 - this.gaugeGapAngle / 2;

    this.x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([this.gaugeStartAngle, this.gaugeEndAngle]);

    this.arcGenerator = ({
      radius,
      startAngle,
      endAngle,
      anticlockwise = false,
    }) => {
      const p = d3.path();
      p.arc(0, 0, radius, startAngle, endAngle, anticlockwise);
      return p.toString();
    };

    this._current = 0;
  }

  _scaffold() {
    d3.select(this.el).selectAll("*").remove();

    this.container = d3
      .select(this.el)
      .append("div")
      .attr("class", "kpi-gauge-chart");

    this.svg = this.container
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      ]);

    this.plusPath = this.svg
      .append("path")
      .attr("class", "plus-path")
      .attr("transform", "translate(-8,-8)")
      .attr(
        "d",
        "M5.71168 0.597473H9.26208V6.65826H15.0001V9.92176H9.26208V15.9825H5.71168V9.92176H0.00952148V6.65826H5.71168V0.597473Z"
      )
      .attr("display", "none");

    this.gradeText = this.svg
      .append("text")
      .attr("class", "grade-text")
      .attr("dy", "0.32em")
      .attr("text-anchor", "middle");

    this.gaugeTrack = this.svg
      .append("path")
      .attr("class", "gauge-track")
      .attr("fill", "none")
      .attr("stroke-width", this.gaugeStrokeWidth)
      .attr("stroke-linecap", "round")
      .attr(
        "d",
        this.arcGenerator({
          radius: this.gaugeRadius,
          startAngle: this.gaugeStartAngle,
          endAngle: this.gaugeEndAngle,
        })
      );

    this.gaugeFill = this.svg
      .append("path")
      .attr("class", "gauge-fill")
      .attr("fill", "none")
      .attr("stroke-width", this.gaugeStrokeWidth)
      .attr("stroke-linecap", "round")
      .attr(
        "d",
        this.arcGenerator({
          radius: this.gaugeRadius,
          startAngle: this.gaugeStartAngle,
          endAngle: this.x(this._current),
        })
      );
  }

  _wrangle() {
    const gradeValue =
      this.data === null ? 0 : Math.min(Math.max(this.data, 0), 1);
    let gradeText;
    if (this.data === null) {
      gradeText = "";
    } else if (gradeValue < 0.7) {
      gradeText = "D";
    } else if (gradeValue < 0.8) {
      gradeText = "C";
    } else if (gradeValue < 0.9) {
      gradeText = "B";
    } else {
      gradeText = "A";
    }
    this.displayData = {
      gradeValue,
      gradeText,
    };
  }

  _render() {
    if (!this.isInView || !this.displayData) return;

    this.svg.attr("class", `grade-${this.displayData.gradeText.toLowerCase()}`);

    this.plusPath.attr("display", this.data === null ? null : "none");

    this.gradeText.text(this.displayData.gradeText);

    this.gaugeFill
      .transition()
      .duration(500)
      .attrTween("d", () => {
        const interpolate = d3.interpolate(
          this._current,
          this.displayData.gradeValue
        );
        return (t) => {
          this._current = interpolate(t);
          return this.arcGenerator({
            radius: this.gaugeRadius,
            startAngle: this.gaugeStartAngle,
            endAngle: this.x(this._current),
          });
        };
      });
  }

  update() {
    this._wrangle();
    this._render();
  }

  setData(_) {
    this.data = _;
    return this;
  }
}
