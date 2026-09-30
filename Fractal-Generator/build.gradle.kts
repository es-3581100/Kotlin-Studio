plugins {
    kotlin("jvm") version "2.4.20"
    application
}

group = "studio.fractal"
version = "0.1.0"

repositories {
    mavenCentral()
}

val openrndrVersion = "0.5.0"

dependencies {
    implementation("org.openrndr:openrndr-application:$openrndrVersion")
    implementation("org.openrndr:openrndr-draw:$openrndrVersion")
    implementation("org.openrndr:openrndr-color:$openrndrVersion")
    implementation("org.openrndr:openrndr-math:$openrndrVersion")
    implementation("org.openrndr:openrndr-extensions:$openrndrVersion")

    runtimeOnly("org.openrndr:openrndr-application-sdl:$openrndrVersion")
    runtimeOnly("org.openrndr:openrndr-gl3:$openrndrVersion")

    testImplementation(kotlin("test-junit"))
}

application {
    mainClass.set("MainKt")
}

kotlin {
    jvmToolchain(17)
}

